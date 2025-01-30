// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/OptionManager.sol";
import {MockERC20} from "./mockERC20.sol";

contract OptionManagerPurchaseTest is Test {
    OptionManager public optionManager;

    IERC20 public exchangeToken;
    IERC20 public linkToken;

    address public seller = address(0x123);
    address public buyer = address(0x456);
    address public asset = address(0x789);
    uint256 public amountAsset = 1;
    uint256 public strikePrice = 1000;
    uint256 public premium = 10;
    uint256 public expiration = block.timestamp + 1 days;

    function setUp() public {
        exchangeToken = IERC20(address(new MockERC20("DD", "DD", 18))); // Déploiement d'un mock ERC20
        linkToken = IERC20(address(new MockERC20("CC", "CC", 18))); // Déploiement d'un mock ERC20
        optionManager = new OptionManager(address(exchangeToken), address(linkToken));
        deal(address(exchangeToken), seller, strikePrice); // Donne des tokens au vendeur
        deal(address(exchangeToken), buyer, premium); // Donne des tokens à l'acheteur
    }

    function testPurchaseSuccess() public {
        vm.startPrank(seller);
        IERC20(exchangeToken).approve(address(optionManager), strikePrice);
        optionManager.creation(asset, amountAsset, strikePrice, premium, expiration);
        uint exchangeTokenBefore = IERC20(exchangeToken).balanceOf(address(optionManager));
        vm.stopPrank();

        vm.startPrank(buyer);
        IERC20(exchangeToken).approve(address(optionManager), premium);
        optionManager.purchase(0);
        uint exchangeTokenAfter = IERC20(exchangeToken).balanceOf(address(optionManager));
        vm.stopPrank();

        (,,,,,,,,address storedBuyer) = optionManager.options(0);
        assertEq(exchangeTokenAfter - exchangeTokenBefore, premium);
        assertEq(storedBuyer, buyer);
    }

    function testPurchaseFailsIfOptionDoesNotExist() public {
        vm.startPrank(buyer);
        vm.expectRevert(bytes("Option does not exist or has expired"));
        optionManager.purchase(0);
        vm.stopPrank();
    }

    function testPurchaseFailsIfTokenTransferFails() public {
        vm.startPrank(seller);
        IERC20(exchangeToken).approve(address(optionManager), strikePrice);
        optionManager.creation(asset, amountAsset, strikePrice, premium, expiration);
        vm.stopPrank();

        vm.startPrank(buyer);
        deal(address(exchangeToken), buyer, 0); 
        vm.expectRevert();
        optionManager.purchase(0);
        vm.stopPrank();
    }
}
