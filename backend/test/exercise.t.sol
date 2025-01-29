// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/OptionManager.sol";
import {MockERC20} from "./mockERC20.sol";

contract OptionManagerExerciseTest is Test {
    OptionManager public optionManager;
    IERC20 public exchangeToken;
    address public seller = address(0x123);
    address public buyer = address(0x456);
    address public asset;
    uint256 public amountAsset = 1;
    uint256 public strikePrice = 1000;
    uint256 public premium = 10;
    uint256 public expiration;

    function setUp() public {
        exchangeToken = IERC20(address(new MockERC20()));
        asset = address(new MockERC20());
        expiration = block.timestamp + 1 days;

        optionManager = new OptionManager(address(exchangeToken));
        deal(address(exchangeToken), seller, strikePrice);
        deal(address(exchangeToken), buyer, premium);

        vm.startPrank(seller);
        IERC20(exchangeToken).approve(address(optionManager), strikePrice);
        optionManager.creation(asset, amountAsset, strikePrice, premium, expiration);
        vm.stopPrank();

        vm.startPrank(buyer);
        IERC20(exchangeToken).approve(address(optionManager), premium);
        optionManager.purchase(0);
        vm.stopPrank();
    }

    function DepositAsset() public {
        deal(asset, buyer, amountAsset);

        vm.startPrank(buyer);
        IERC20(asset).approve(address(optionManager), amountAsset);
        optionManager.depositAsset(0);
        vm.stopPrank();
    }

    function testExerciseSuccess() public {
        DepositAsset();
        vm.warp(expiration + 1);

        uint buyerStrikeBefore = IERC20(exchangeToken).balanceOf(buyer);
        uint sellerPremiumBefore = IERC20(exchangeToken).balanceOf(seller);
        uint sellerAmountAssetBefore = IERC20(asset).balanceOf(seller);

        vm.startPrank(buyer);
        optionManager.exercise(0);
        vm.stopPrank();

        uint buyerStrikeAfter = IERC20(exchangeToken).balanceOf(buyer);
        uint sellerPremiumAfter = IERC20(exchangeToken).balanceOf(seller);
        uint sellerAmountAssetAfter = IERC20(asset).balanceOf(seller);

        assertEq(buyerStrikeAfter - buyerStrikeBefore, strikePrice);
        assertEq(sellerAmountAssetAfter - sellerAmountAssetBefore, amountAsset);
        assertEq(sellerPremiumAfter - sellerPremiumBefore, premium);
    }

    function testExerciseFailsIfNotExpired() public {
        vm.startPrank(buyer);
        vm.expectRevert(bytes("Option not exercisable yet"));
        optionManager.exercise(0);
        vm.stopPrank();
    }

    function testExerciseFailsIfOptionDoesNotExist() public {
        vm.startPrank(buyer);
        vm.expectRevert(bytes("Option does not exist or has expired"));
        optionManager.exercise(1);
        vm.stopPrank();
    }
}
