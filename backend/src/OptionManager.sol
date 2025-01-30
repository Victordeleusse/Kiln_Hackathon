// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

/**
 * @title OptionManager
 */

contract OptionManager is AutomationCompatibleInterface {

    using SafeERC20 for IERC20;

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
    address public usdcAddress;
    address private constant ETH_ADDRESS = address(0);


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
     * @dev Constructor to set the USDC address dynamically at deployment.
     * @param _usdcAddress The address of the USDC token.
     */
    constructor(address _usdcAddress) {
        require(_usdcAddress != address(0), "USDC address cannot be zero");
        usdcAddress = _usdcAddress;
    }

    /**
     * @dev Chainlink Keepers function that checks if any option has expired.
     */
    function checkUpkeep(bytes calldata) external override returns (bool upkeepNeeded, bytes memory performData) {
        uint256[] memory exercisedOptions = new uint256[](optionCount);
        uint256 count = 0;

        for (uint256 i = 0; i < optionCount; i++) {
            if (block.timestamp >= options[i].expiry) {
                Option storage option = options[i];
                if (option.assetTransferedToTheContract) {
                    exercisedOptions[count] = i;
                    count++;
                }
                else {
                    // Give back the money to the seller if put option buyer has not transfered the asset at expiry
                    IERC20(usdcAddress).safeTransfer(option.seller, option.strikePrice);
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
     * @dev To set internal logic after a put option is exercised at expiry.
     * @param optionId The ID of the option to settle.
     */
    function settleExpiredOption(uint256 optionId) internal {
        Option storage option = options[optionId];
        // Ensure no error from chainlink automation trigger 
        require(block.timestamp >= option.expiry, "Option has not expired yet");

        // Transfer the asset amount from contract to the seller
        if (option.asset == ETH_ADDRESS) {
            (bool success, ) = payable(option.seller).call{value: option.assetAmount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(option.asset).safeTransfer(option.seller, option.assetAmount);}

        // Transfer the strike price from contract to the buyer
        IERC20(usdcAddress).safeTransfer(option.buyer, option.strikePrice);
        
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

        uint256 allowance = IERC20(usdcAddress).allowance(msg.sender, address(this));
        if (allowance < strikePrice) {
            revert OptionManager__InsufficientAllowanceSellerPut();
        }

        uint256 balance = IERC20(usdcAddress).balanceOf(msg.sender);
        if (balance < strikePrice) {
            revert OptionManager__InsufficientBalanceSellerPut();
        }

        // Transfer USDC strike price to the contract safely
        IERC20(usdcAddress).safeTransferFrom(msg.sender, address(this), strikePrice);


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
            fundTransferedToTheContract: true
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
        require(option.buyer == address(0), "Option already bought");
        require(option.expiry > block.timestamp, "Option has expired");

        // Transfer the strike price in USDC from contract to the buyer
        // Against Re entrency attack
        uint256 strikePrice = option.strikePrice;
        address seller = option.seller;
        emit OptionDeleted(optionId);
        delete options[optionId];
        IERC20(usdcAddress).safeTransfer(seller, strikePrice);
    }

    /**
     * @dev Allows a buyer to purchase a PUT option.
     * @param optionId The ID of the option to purchase.
     */
    function buyOption(uint256 optionId) external {
        Option storage option = options[optionId];
        require(option.buyer == address(0), "Option already bought");
        require(option.expiry > block.timestamp, "Option has expired");
        
        uint256 allowance = IERC20(usdcAddress).allowance(msg.sender, address(this));
        if (allowance < option.premium) {
            revert OptionManager__InsufficientAllowanceUSDCBuyerPut();
        }

        uint256 balance = IERC20(usdcAddress).balanceOf(msg.sender);
        if (balance < option.premium) {
            revert OptionManager__InsufficientBalanceUSDCBuyerPut();
        }

        IERC20(usdcAddress).safeTransferFrom(msg.sender, option.seller, option.premium);

        option.buyer = msg.sender;
        emit OptionBought(optionId, msg.sender);
    }

    /**
     * @dev Allows the buyer of a PUT option to send the asset amount to the contract.
     * This must be done before the expiry date.
     * @param optionId The ID of the option.
     */
    function sendAssetToContract(uint256 optionId) external payable {
        Option storage option = options[optionId];
        require(msg.sender == option.buyer, "Only the buyer can call this function");
        require(!option.assetTransferedToTheContract, "Asset amount already stored");
        require(option.expiry > block.timestamp, "Option has expired");

        if (option.asset == ETH_ADDRESS) {
            require(msg.value == option.assetAmount, "Incorrect ETH amount sent");
        } else {
            uint256 allowance = IERC20(option.asset).allowance(msg.sender, address(this));
            if (allowance < option.assetAmount) {
                revert OptionManager__InsufficientAllowanceAssetBuyerPut();
            }
            IERC20(option.asset).safeTransferFrom(msg.sender, address(this), option.assetAmount);}
        
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

        if (option.asset == ETH_ADDRESS) {
                (bool success, ) = payable(msg.sender).call{value: option.assetAmount}("");
                require(success, "ETH transfer failed");
        } else {
            IERC20(option.asset).safeTransfer(msg.sender, option.assetAmount);}
        
        option.assetTransferedToTheContract = false;
        emit AssetReclaimFromTheContract(optionId, msg.sender);
    }

    fallback() external payable {
        revert("Unknown function call");
    }

    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}
