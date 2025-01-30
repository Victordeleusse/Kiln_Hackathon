// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {AutomationCompatibleInterface} from "@chainlink/src/v0.8/automation/AutomationCompatible.sol";
import {LinkTokenInterface} from "@chainlink/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract OptionManager is ReentrancyGuard, Ownable, AutomationCompatibleInterface {
    using SafeERC20 for IERC20;

    address public forwader;
    address public registry;
    address public registrar;

    address public exchangeToken;
    LinkTokenInterface public linkToken;

    uint256 public optionCounter;        
    mapping(uint256 => Option) public options;

    struct Option {
        uint256 id;
        address asset;
        uint256 amountAsset;
        uint256 strikePrice;
        uint256 premium;
        uint256 expirationTime;
        bool depositedAsset;
        address seller;
        address buyer;     
    }

    event OptionCreated(uint256 id, address asset, uint256 amountAsset, uint256 strikePrice, uint256 expirationTime, uint256 premium, address seller);
    event OptionPurchased(uint256 id, address buyer);
    event DepositedAsset(uint256 id, address asset, uint256 amountAsset, address buyer);
    event WithdrawnAsset(uint256 id, address asset, uint256 amountAsset, address buyer);
    event OptionExercised(uint256 id);
    event OptionExpired(uint256 id);

    constructor(address _exchangeToken, address _linkToken) Ownable(msg.sender) {
        exchangeToken = _exchangeToken;
        linkToken = LinkTokenInterface(_linkToken);
    }

    function fundUpkeep(uint256 amount) external onlyOwner {
        require(linkToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    function setForwarder(address _forwarder) public onlyOwner {
        forwader = _forwarder;
    }

    function setRegistry(address _registry) external onlyOwner {
        registry = _registry;
    }

    function setRegistrar(address _registrar) external onlyOwner {
        registrar = _registrar;
    }

   function checkUpkeep(bytes calldata checkData) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < optionCounter; i++) {
            Option memory option = options[i];

            if (block.timestamp >= option.expirationTime) {
                return (true, abi.encode(i));
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata data) external override {
        require(msg.sender == forwader, "Only the forwarder can perform upkeep");
        
        uint256 id = abi.decode(data, (uint256));
        exercise(id);
    }

    // add function to delete an option, and add it in the end of the exercise function

    function creation(address _asset, uint256 _amountAsset, uint256 _strikePrice, uint256 _premium, uint256 _expirationTime) public nonReentrant {
        require(_expirationTime > block.timestamp, "Expiration date must be in the future");
        require(_amountAsset > 0 && _premium > 0 && _strikePrice > 0, "Amount must be greater than 0");
        require(_asset != address(0), "Asset address must be valid");

        Option memory newOption = Option(optionCounter, _asset, _amountAsset, _strikePrice, _premium, _expirationTime, false, msg.sender, address(0));
        options[optionCounter] = newOption;

        IERC20(exchangeToken).safeTransferFrom(msg.sender, address(this), _strikePrice);
        
        optionCounter++;
        emit OptionCreated(newOption.id, newOption.asset, newOption.amountAsset, newOption.strikePrice, newOption.expirationTime, newOption.premium, newOption.seller);
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
        emit WithdrawnAsset(option.id, option.asset, option.amountAsset, msg.sender);
    }

    function exercise(uint256 id) public nonReentrant {
        Option storage option = options[id];
        require(option.seller != address(0), "Option does not exist or has expired");
        require(option.expirationTime <= block.timestamp, "Option not exercisable yet");

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

