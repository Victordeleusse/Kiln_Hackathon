// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract OptionManager {
    address public exchangeToken;
    struct Option {
        uint256 id;
        address asset;
        uint256 amountAsset;
        uint256 strikePrice;
        uint256 premium;
        uint256 expiration;
        bool depositedAsset;
        address seller;
        address buyer;     
    }

    mapping(uint256 => Option) public options;
    uint256 public optionCounter;        

    event OptionCreated(uint256 id, address asset, uint256 amountAsset, uint256 strikePrice, uint256 expiration, uint256 premium, address seller);
    event OptionPurchased(uint256 id, address buyer);
    event DepositedAsset(uint256 id, address asset, uint256 amountAsset, address buyer);
    event withdrawnAsset(uint256 id, address asset, uint256 amountAsset, address buyer);
    event OptionExercised(uint256 id);
    event OptionExpired(uint256 id);

    constructor(address _exchangeToken) {
        exchangeToken = _exchangeToken;
    }

    function creation(address asset, uint256 amountAsset, uint256 strikePrice, uint256 premium, uint256 expiration) public {
        require(expiration > block.timestamp, "Expiration date must be in the future");
        require(amountAsset > 0 && premium > 0 && strikePrice > 0, "Amount must be greater than 0");
        require(asset != address(0), "Asset address must be valid");

        Option memory newOption = Option(optionCounter, asset, amountAsset, strikePrice, premium, expiration, false, msg.sender, address(0));
        options[optionCounter] = newOption;

        bool success = IERC20(exchangeToken).transferFrom(msg.sender, address(this), strikePrice);
        require(success, "Token transfer failed");
        
        optionCounter++;
        emit OptionCreated(newOption.id, newOption.asset, newOption.amountAsset, newOption.strikePrice, newOption.expiration, newOption.premium, newOption.seller);
    }

    function purchase(uint256 id) public payable {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");

        bool success = IERC20(exchangeToken).transferFrom(msg.sender, address(this), option.premium);
        require(success, "Token transfer failed");

        option.buyer = msg.sender;

        emit OptionPurchased(option.id, option.buyer);
    }

    function depositAsset(uint256 id) public {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");
        require(option.buyer == msg.sender, "Only the buyer can deposit the asset");
        require(option.depositedAsset == false, "Asset already deposited");

        bool success = IERC20(option.asset).transferFrom(msg.sender, address(this), option.amountAsset);
        require(success, "Token transfer failed");

        option.depositedAsset = true;

        emit DepositedAsset(option.id, option.asset, option.amountAsset, msg.sender);
    }

    function withdrawAsset(uint256 id) public {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");
        require(option.buyer == msg.sender, "Only the buyer can withdraw the asset");
        require(option.depositedAsset == true, "Asset not deposited yet");

        bool success = IERC20(option.asset).transfer(msg.sender, option.amountAsset);
        require(success, "Token transfer failed");

        option.depositedAsset = false;
        emit withdrawnAsset(option.id, option.asset, option.amountAsset, msg.sender);
    }

    function exercise(uint256 id) public {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");
        require(option.expiration <= block.timestamp, "Option not exercisable yet");

        IERC20(exchangeToken).transfer(option.seller, option.premium);

        address newOwnerAsset = (option.depositedAsset ? option.seller : option.buyer);
        address newOwnerStrike = (option.depositedAsset ? option.buyer : option.seller);

        IERC20(option.asset).transfer(newOwnerAsset, option.amountAsset);
        IERC20(exchangeToken).transfer(newOwnerStrike, option.strikePrice);

        if (option.depositedAsset)
            emit OptionExercised(option.id);
        
        emit OptionExpired(option.id);
    }
}

