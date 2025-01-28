// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OptionManager
 * @dev A contract to allow option's sellers/buyers to create and sell / buy, and buyers to exercise if conditions are met.
 */

contract OptionsMarketplace {

	/* Errors */
	error OptionsMarketplace__buyOptionFailed();
	error OptionsMarketplace__callStrikeFailed();
	error OptionsMarketplace__putStrikeFailed();

	/* Type declarations */
    enum OptionType { PUT, CALL }

    struct Option {
        OptionType optionType;
        address seller;
        address buyer;
        uint256 strikePrice;
        uint256 premium;
        uint256 expiry;
    }

	/* State Variables */
	uint256 public optionCount;
    mapping(uint256 => Option) public options;

	/* Events */
	event OptionCreated(
        uint256 optionId,
        OptionType optionType,
        address indexed seller,
        uint256 strikePrice,
        uint256 premium,
        uint256 expiry
    );
	event OptionBought(uint256 optionId, address indexed buyer);
    event OptionExercised(uint256 optionId, address indexed buyer);

	/* Functions */

	function createOption(
        OptionType optionType,
        uint256 strikePrice,
        uint256 premium,
        uint256 expiry
    ) external {
        require(expiry > block.timestamp, "Expiry must be in the future");

        options[optionCount] = Option({
            optionType: optionType,
            seller: msg.sender,
            buyer: address(0),
            strikePrice: strikePrice,
            premium: premium,
            expiry: expiry,
            exercised: false
        });

        emit OptionCreated(optionCount, optionType, msg.sender, strikePrice, premium, expiry);
        optionCount++;
    }

    // Buy an option
    function buyOption(uint256 optionId) external payable {
        Option storage option = options[optionId];
        require(option.seller != address(0), "Option does not exist");
        require(option.buyer == address(0), "Option already sold");
        require(msg.value == option.premium, "Incorrect premium amount");
        require(block.timestamp < option.expiry, "Option has expired");

        option.buyer = msg.sender;
        (bool success, ) = option.seller.call{value: msg.value}("");
		if (!success) {
            revert OptionsMarketplace__buyOptionFailed();
        }

        emit OptionBought(optionId, msg.sender);
    }

    // Exercise an option
    function exerciseOption(uint256 optionId) external payable {
        Option storage option = options[optionId];
        require(option.buyer == msg.sender, "Only the buyer can exercise this option");
        require(block.timestamp < option.expiry, "Option has expired");
        require(!option.exercised, "Option already exercised");

        option.exercised = true;

        if (option.optionType == OptionType.CALL) {
            // CALL: Buyer pays strike price to seller
            require(msg.value == option.strikePrice, "Incorrect strike price sent");
            (bool success, ) = option.seller.call{value: msg.value}("");
			if (!success) {revert OptionsMarketplace__callStrikeFailed();}
        } else if (option.optionType == OptionType.PUT) {
            // PUT: Seller pays strike price to buyer
            (bool success, ) = option.buyer.call{value: option.strikePrice}("");
			if (!success) {revert OptionsMarketplace__putStrikeFailed();}
        }

        emit OptionExercised(optionId, msg.sender);
    }
}
