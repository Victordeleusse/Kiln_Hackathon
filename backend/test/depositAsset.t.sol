// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/OptionManager.sol";
import {MockERC20} from "./mockERC20.sol";

contract OptionManagerDepositWithdrawTest is Test {
    OptionManager public optionManager;

    IERC20 public exchangeToken;

    address public seller = address(0x123);
    address public buyer = address(0x456);
    address public asset;

    uint256 public amountAsset = 1;
    uint256 public strikePrice = 1000;
    uint256 public premium = 10;
    uint256 public expiration = block.timestamp + 1 days;

    function setUp() public {
        exchangeToken = IERC20(address(new MockERC20()));
        asset = address(new MockERC20());

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

    function testDepositAssetSuccess() public {
        uint assetAmountBefore = IERC20(asset).balanceOf(address(optionManager));
        deal(asset, buyer, amountAsset);

        vm.startPrank(buyer);
        IERC20(asset).approve(address(optionManager), amountAsset);

        optionManager.depositAsset(0);
        vm.stopPrank();

        uint assetAmountAfter = IERC20(asset).balanceOf(address(optionManager));
        (,,,,,, bool depositedAsset,,) = optionManager.options(0);

        assertEq(depositedAsset, true);
        assertEq(assetAmountAfter - assetAmountBefore, amountAsset);
    }

    function testDepositAssetFailsIfNotBuyer() public {
        deal(asset, buyer, amountAsset);

        vm.startPrank(seller);
        IERC20(asset).approve(address(optionManager), amountAsset);
        vm.expectRevert(bytes("Only the buyer can deposit the asset"));
        optionManager.depositAsset(0);
        vm.stopPrank();
    }

    function testWithdrawAssetSuccess() public {
        testDepositAssetSuccess();

        vm.startPrank(buyer);
        optionManager.withdrawAsset(0);
        vm.stopPrank();

        (,,,,,, bool depositedAsset,,) = optionManager.options(0);
        assertEq(depositedAsset, false);
    }

    function testWithdrawAssetFailsIfNotBuyer() public {
        testDepositAssetSuccess();

        vm.startPrank(seller);
        vm.expectRevert(bytes("Only the buyer can withdraw the asset"));
        optionManager.withdrawAsset(0);
        vm.stopPrank();
    }

    function testWithdrawAssetFailsIfNotDeposited() public {
        vm.startPrank(buyer);
        vm.expectRevert(bytes("Asset not deposited yet"));
        optionManager.withdrawAsset(0);
        vm.stopPrank();
    }
}
