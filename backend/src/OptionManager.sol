// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title OptionManager
 * @dev A contract to allow option's sellers/buyers to create and sell / buy, and buyers to exercise if conditions are met.
 */

contract OptionManager {

	/* Errors */
	error OptionManager__buyOptionFailed();
	error OptionManager__callStrikeFailed();
	error OptionManager__putStrikeFailed();
    error OptionManager__InsufficientAllowanceSellerPut();
    error OptionManager__InsufficientBalanceSellerPut();
    error OptionManager__InitialTransferStrikePriceFundFailed();
    error OptionManager__InsufficientAllowanceBuyerPut();
    error OptionManager__InsufficientBalanceBuyerPut();
    error OptionManager__BuyingPremiumTransferFailed();

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
        bool    exercised;
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
    event OptionChangeOfExercised(uint256 optionId, address indexed buyer, bool indexed exercised);
    event OptionDeleted(uint256 optionId);
    event AssetSentToTheContract(uint256 optionId, address indexed buyer)

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
            exercised: true
        });

        emit OptionCreated(optionCount, OptionType.PUT, msg.sender, strikePrice, premium, asset, assetAmount, expiry);
        optionCount++;
    }

    /**
     * @dev Allows a buyer to purchase a PUT option.
     * @param optionId The ID of the option to purchase.
     */
    function buyOption(uint256 optionId) external {
        Option storage option = options[optionId];
        require(option.buyer == address(0), "Option already bought");
        require(option.expiry > block.timestamp, "Option has expired");
        
        uint256 allowance = IERC20(USDC_ADDRESS).allowance(msg.sender, address(this));
        if (allowance < option.premium) {
            revert OptionManager__InsufficientAllowanceBuyerPut();
        }

        uint256 balance = IERC20(USDC_ADDRESS).balanceOf(msg.sender);
        if (balance < option.premium) {
            revert OptionManager__InsufficientBalanceBuyerPut();
        }

        bool transferSuccess = IERC20(USDC_ADDRESS).transferFrom(msg.sender, option.seller, option.premium);
        if (!transferSuccess) {
            revert OptionManager__BuyingPremiumTransferFailed();
        }

        option.buyer = msg.sender;

        emit OptionBought(optionId, msg.sender);
    }


    function changeExercise(uint256 optionId) external {
        Option storage option = options[optionId];
        require(option.buyer == msg.sender, "Only the buyer can mark this option as exercised");
        require(block.timestamp < option.expiry, "Option has expired");

        option.exercised = !option.exercised;

        emit OptionChangeOfExercised(optionId, msg.sender, option.exercised);
    }

    /**
     * @dev Allows the buyer of a PUT option to send the asset amount to the contract.
     * This must be done before the expiry date.
     * @param optionId The ID of the option.
     */
    function sendAssetToContract(uint256 optionId) external {
        Option storage option = options[optionId];
        require(msg.sender == option.buyer, "Only the buyer can call this function");
        require(option.expiry > block.timestamp, "Option has expired");

        uint256 allowance = IERC20(option.asset).allowance(msg.sender, address(this));
        if (allowance < option.assetAmount) {
            revert OptionManager__InsufficientAllowance();
        }
        
        bool assetTransferSuccess = IERC20(option.asset).transferFrom(msg.sender, address(this), option.assetAmount);
        if (!assetTransferSuccess) {
            revert OptionManager__TransferFailed();
        }

        emit AssetSentToTheContract(optionId, msg.sender);
    }


    // Exercise an option
    function exerciseOption(uint256 optionId) external payable {
        Option storage option = options[optionId];
        require(option.buyer == msg.sender, "Only the buyer can exercise this option");
        require(option.exercised, "Option must be marked as exercised.");

        delete options[optionId];
        if (option.optionType == OptionType.CALL) {
            // CALL: Buyer pays strike price to seller
            require(msg.value == option.strikePrice, "Incorrect strike price sent");
            (bool success, ) = option.seller.call{value: msg.value}("");
			if (!success) {revert OptionManager__callStrikeFailed();}
			IERC20(option.asset).transfer(msg.sender, option.assetAmount);
        } else if (option.optionType == OptionType.PUT) {
            // PUT: Seller pays strike price to buyer 
            require(
                IERC20(option.asset).allowance(option.buyer, address(this)) >= option.assetAmount,
                "Insufficient token allowance by buyer"
            );
			IERC20(option.asset).transferFrom(option.buyer, option.seller, option.assetAmount);
            (bool success, ) = option.buyer.call{value: option.strikePrice}("");
			if (!success) {revert OptionManager__putStrikeFailed();}
        }
        
        emit OptionExercised(optionId, msg.sender);
    }

    function reclaimOption(uint256 optionId) external {
        Option storage option = options[optionId];
        require(option.seller == msg.sender, "Only seller can reclaim the option");
        require(!option.exercised, "Option must be marked as exercised.");
        require(block.timestamp >= option.expiry, "Option has not expired");
        require(option.buyer == address(0), "Option already sold");

        delete options[optionId];
        IERC20(option.asset).transfer(option.seller, option.assetAmount);
    }
}
