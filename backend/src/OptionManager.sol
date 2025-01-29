// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract OptionManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public exchangeToken;
    uint256 public optionCounter;        
    mapping(uint256 => Option) public options;

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

    event OptionCreated(uint256 id, address asset, uint256 amountAsset, uint256 strikePrice, uint256 expiration, uint256 premium, address seller);
    event OptionPurchased(uint256 id, address buyer);
    event DepositedAsset(uint256 id, address asset, uint256 amountAsset, address buyer);
    event withdrawnAsset(uint256 id, address asset, uint256 amountAsset, address buyer);
    event OptionExercised(uint256 id);
    event OptionExpired(uint256 id);

    constructor(address _exchangeToken) {
        exchangeToken = _exchangeToken;
    }

    function creation(address asset, uint256 amountAsset, uint256 strikePrice, uint256 premium, uint256 expiration) public nonReentrant {
        require(expiration > block.timestamp, "Expiration date must be in the future");
        require(amountAsset > 0 && premium > 0 && strikePrice > 0, "Amount must be greater than 0");
        require(asset != address(0), "Asset address must be valid");

        Option memory newOption = Option(optionCounter, asset, amountAsset, strikePrice, premium, expiration, false, msg.sender, address(0));
        options[optionCounter] = newOption;

        IERC20(exchangeToken).safeTransferFrom(msg.sender, address(this), strikePrice);
        
        optionCounter++;
        emit OptionCreated(newOption.id, newOption.asset, newOption.amountAsset, newOption.strikePrice, newOption.expiration, newOption.premium, newOption.seller);
    }

    function purchase(uint256 id) public nonReentrant {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");

        IERC20(exchangeToken).safeTransferFrom(msg.sender, address(this), option.premium);

        option.buyer = msg.sender;

        emit OptionPurchased(option.id, option.buyer);
    }

    function depositAsset(uint256 id) public nonReentrant {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");
        require(option.buyer == msg.sender, "Only the buyer can deposit the asset");
        require(option.depositedAsset == false, "Asset already deposited");

        IERC20(option.asset).safeTransferFrom(msg.sender, address(this), option.amountAsset);

        option.depositedAsset = true;

        emit DepositedAsset(option.id, option.asset, option.amountAsset, msg.sender);
    }

    function withdrawAsset(uint256 id) public nonReentrant {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");
        require(option.buyer == msg.sender, "Only the buyer can withdraw the asset");
        require(option.depositedAsset == true, "Asset not deposited yet");

        IERC20(option.asset).safeTransfer(msg.sender, option.amountAsset);

        option.depositedAsset = false;
        emit withdrawnAsset(option.id, option.asset, option.amountAsset, msg.sender);
    }

    function exercise(uint256 id) public nonReentrant {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");
        require(option.expiration <= block.timestamp, "Option not exercisable yet");

        IERC20(exchangeToken).safeTransfer(option.seller, option.premium);

        address newOwnerAsset = (option.depositedAsset ? option.seller : option.buyer);
        address newOwnerStrike = (option.depositedAsset ? option.buyer : option.seller);

        IERC20(option.asset).safeTransfer(newOwnerAsset, option.amountAsset);
        IERC20(exchangeToken).safeTransfer(newOwnerStrike, option.strikePrice);

        if (option.depositedAsset)
            emit OptionExercised(option.id);
        
        emit OptionExpired(option.id);
    }
}

