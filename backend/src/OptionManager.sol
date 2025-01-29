// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";


/**
 * @title OptionManager
 */

contract OptionManager {

	/* Errors */
	error OptionManager__buyOptionFailed();
	error OptionManager__callStrikeFailed();
	error OptionManager__putStrikeFailed();
    error OptionManager__InsufficientAllowanceSellerPut();
    error OptionManager__InsufficientBalanceSellerPut();
    error OptionManager__InitialTransferStrikePriceFundFailed();
    error OptionManager__InsufficientAllowanceUSDCBuyerPut();
    error OptionManager__InsufficientBalanceUSDCBuyerPut();
    error OptionManager__BuyingPremiumTransferFailed();
    error OptionManager__InsufficientAllowanceAssetBuyerPut();
    error OptionManager__TransferAssetFailed();
    error OptionManager_AssetTransferFailedAtExpiry();
    error OptionManager_USDCTransferFailedAtExpiry();

	/* Type declarations */
    enum OptionType { PUT, CALL }

    struct Option {
        OptionType optionType;
        address seller;
        address buyer;
        uint256 strikePrice;
        uint256 premium;
		address asset;
		uint256 assetAmount;
        uint256 expiry;
        bool    assetTransferedToTheContract;
        bool    fundTransferedToTheContract;
    }

	/* State Variables */
	uint256 public optionCount;
    mapping(uint256 => Option) public options;
    
    /* Constants */
    address private constant USDC_ADDRESS = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

	/* Events */
	event OptionCreated(
        uint256 optionId,
        OptionType optionType,
        address indexed seller,
        uint256 strikePrice,
        uint256 premium,
		address asset,
		uint256 assetAmount,
        uint256 expiry
    );
    event OptionBought(uint256 optionId, address indexed buyer);
    event OptionExercised(uint256 optionId, address indexed buyer);
    event OptionDeleted(uint256 optionId);
    event AssetSentToTheContract(uint256 optionId, address indexed buyer);
    event AssetReclaimFromTheContract(uint256 optionId, address indexed buyer);

    /**
     * @dev Chainlink Keepers function that checks if any option has expired.
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256[] memory exercisedOptions = new uint256[](optionCount);
        uint256 count = 0;

        for (uint256 i = 0; i < optionCount; i++) {
            if (block.timestamp >= options[i].expiry) {
                if (options[i].assetTransferedToTheContract) {
                    exercisedOptions[count] = i;
                    count++;
                }
                else {
                    // Give back the money to the seller
                    bool usdcTransferSuccess = IERC20(USDC_ADDRESS).transfer(option.seller, option.strikePrice);
                    if (!usdcTransferSuccess) {
                        revert OptionManager_USDCTransferFailedAtExpiry();
                    }
                    emit OptionDeleted(i);
                    delete options[i];
                }
            }
        }

        if (count > 0) {
            upkeepNeeded = true;
            performData = abi.encode(exercisedOptions, count);
        } else {
            upkeepNeeded = false;
            performData = "";
        }
    }

    /**
     * @dev Chainlink Keepers function that processes options to be exercised at expiry.
     */
    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory exercisedOptions, uint256 count) = abi.decode(performData, (uint256[], uint256));

        for (uint256 i = 0; i < count; i++) {
            settleExpiredOption(exercisedOptions[i]);
        }
    }

    /**
     * @dev To set internal logic after an option is exercised at expiry.
     * @param optionId The ID of the option to settle.
     */
    function settleExpiredOption(uint256 optionId) internal {
        Option storage option = options[optionId];
        // Ensure no error from chainlink automation trigger 
        require(block.timestamp >= option.expiry, "Option has not expired yet");
        require(option.exercised, "Option was not exercised");

        // Transfer the asset amount from contract to the seller
        bool assetTransferSuccess = IERC20(option.asset).transfer(option.seller, option.assetAmount);
        if (!assetTransferSuccess) {
            revert OptionManager_AssetTransferFailedAtExpiry();
        }
        // Transfer the strike price in USDC from contract to the buyer
        bool usdcTransferSuccess = IERC20(USDC_ADDRESS).transfer(option.buyer, option.strikePrice);
        if (!usdcTransferSuccess) {
            revert OptionManager_USDCTransferFailedAtExpiry();
        }
        
        // Delete the option from storage
        emit OptionDeleted(optionId);
        delete options[optionId];
    }

    /**
     * @dev Create a PUT option.
     * @param strikePrice The strike price in USDC.
     * @param premium The premium for the option.
     * @param expiry The expiration timestamp of the option.
     * @param asset The address of the ERC20 asset to lock for the option.
     * @param assetAmount The amount of the asset to lock for the option.
     */
	function createOptionPut(
        uint256 strikePrice,
        uint256 premium,
        uint256 expiry,
		address asset,
    	uint256 assetAmount
    ) external {
        require(expiry > block.timestamp, "Expiry must be in the future");

        uint256 allowance = IERC20(USDC_ADDRESS).allowance(msg.sender, address(this));
        if (allowance < strikePrice) {
            revert OptionManager__InsufficientAllowanceSellerPut();
        }

        uint256 balance = IERC20(USDC_ADDRESS).balanceOf(msg.sender);
        if (balance < strikePrice) {
            revert OptionManager__InsufficientBalanceSellerPut();
        }

        // Transfer USDC strike price to the contract
        bool usdcTransferSuccess = IERC20(USDC_ADDRESS).transferFrom(msg.sender, address(this), strikePrice);
        if (!usdcTransferSuccess) {
            revert OptionManager__InitialTransferStrikePriceFundFailed();
        }

        options[optionCount] = Option({
            optionType: OptionType.PUT,
            seller: msg.sender,
            buyer: address(0),
            strikePrice: strikePrice,
            premium: premium,
            expiry: expiry,
			asset: asset,
        	assetAmount: assetAmount,
            assetTransferedToTheContract: false,
            fundTransferedToTheContract: true,
            exercised: true
        });

        emit OptionCreated(optionCount, OptionType.PUT, msg.sender, strikePrice, premium, asset, assetAmount, expiry);
        optionCount++;
    }

    /**
     * @dev Allows a seller to delete a PUT option if not already purchased.
     * @param optionId The ID of the option to delete.
     */
    function deleteOptionPut(uint256 optionId) external {
        Option storage option = options[optionId];
        require(msg.sender == option.seller, "Only the seller can call this function");
        require(option.buyer != address(0), "Option already bought");
        require(option.expiry > block.timestamp, "Option has expired");

        // Transfer the strike price in USDC from contract to the buyer
        bool usdcTransferSuccess = IERC20(USDC_ADDRESS).transfer(option.seller, option.strikePrice);
        if (!usdcTransferSuccess) {
            revert OptionManager_USDCTransferFailedAtExpiry();
        }

        emit OptionDeleted(optionId);
        delete options[optionId];
    }

    /**
     * @dev Allows a buyer to purchase a PUT option.
     * @param optionId The ID of the option to purchase.
     */
    function buyOption(uint256 optionId) external {
        Option storage option = options[optionId];
        require(option.buyer == address(0), "Option already bought");
        require(option.fundTransferedToTheContract, "Option must be funded");
        require(option.expiry > block.timestamp, "Option has expired");
        
        uint256 allowance = IERC20(USDC_ADDRESS).allowance(msg.sender, address(this));
        if (allowance < option.premium) {
            revert OptionManager__InsufficientAllowanceUSDCBuyerPut();
        }

        uint256 balance = IERC20(USDC_ADDRESS).balanceOf(msg.sender);
        if (balance < option.premium) {
            revert OptionManager__InsufficientBalanceUSDCBuyerPut();
        }

        bool transferSuccess = IERC20(USDC_ADDRESS).transferFrom(msg.sender, option.seller, option.premium);
        if (!transferSuccess) {
            revert OptionManager__BuyingPremiumTransferFailed();
        }

        option.buyer = msg.sender;
        emit OptionBought(optionId, msg.sender);
    }

    /**
     * @dev Allows the buyer of a PUT option to send the asset amount to the contract.
     * This must be done before the expiry date.
     * @param optionId The ID of the option.
     */
    function sendAssetToContract(uint256 optionId) external {
        Option storage option = options[optionId];
        require(msg.sender == option.buyer, "Only the buyer can call this function");
        require(!option.assetTransferedToTheContract, "Asset amount already stored");
        require(option.expiry > block.timestamp, "Option has expired");

        uint256 allowance = IERC20(option.asset).allowance(msg.sender, address(this));
        if (allowance < option.assetAmount) {
            revert OptionManager__InsufficientAllowanceAssetBuyerPut();
        }

        bool assetTransferSuccess = IERC20(option.asset).transferFrom(msg.sender, address(this), option.assetAmount);
        if (!assetTransferSuccess) {
            revert OptionManager__TransferAssetFailed();
        }
        
        option.assetTransferedToTheContract = true;
        emit AssetSentToTheContract(optionId, msg.sender);
    }

    /**
     * @dev Allows the buyer of a PUT option to send the asset amount to the contract.
     * This must be done before the expiry date.
     * @param optionId The ID of the option.
     */
    function reclaimAssetFromContract(uint256 optionId) external {
        Option storage option = options[optionId];
        require(msg.sender == option.buyer, "Only the buyer can call this function");
        require(option.assetTransferedToTheContract, "No asset amount to reclaim");
        require(option.expiry > block.timestamp, "Option has expired");

        bool assetTransferSuccess = IERC20(option.asset).transferFrom(msg.sender, address(this), option.assetAmount);
        if (!assetTransferSuccess) {
            revert OptionManager__TransferAssetFailed();
        }
        
        option.assetTransferedToTheContract = false;
        emit AssetReclaimFromTheContract(optionId, msg.sender);
    }
}
