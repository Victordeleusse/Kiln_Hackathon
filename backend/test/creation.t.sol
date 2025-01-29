// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/OptionManager.sol";
import {MockERC20} from "./mockERC20.sol";

contract OptionManagerTest is Test {
    OptionManager public optionManager;
    IERC20 public exchangeToken;
    address public seller = address(0x123);
    address public asset = address(0x456);
    uint256 public amountAsset = 1;
    uint256 public strikePrice = 1000;
    uint256 public premium = 10;
    uint256 public expiration = block.timestamp + 1 days;

    function setUp() public {
        exchangeToken = IERC20(address(new MockERC20())); // Déploiement d'un mock ERC20
        optionManager = new OptionManager(address(exchangeToken));
        deal(address(exchangeToken), seller, strikePrice); // Donne des tokens au vendeur
    }

    function testCreationSuccess() public {
        vm.startPrank(seller);
        
        IERC20(exchangeToken).approve(address(optionManager), strikePrice);
        optionManager.creation(asset, amountAsset, strikePrice, premium, expiration);
        
        vm.stopPrank();

        (uint256 id, address storedAsset, uint256 storedAmountAsset, uint256 storedStrikePrice, uint256 storedPremium, , ,  address storedSeller, ) = optionManager.options(0);

        assertEq(id, 0);
        assertEq(storedAsset, asset);
        assertEq(storedAmountAsset, amountAsset);
        assertEq(storedStrikePrice, strikePrice);
        assertEq(storedPremium, premium);
        assertEq(storedSeller, seller);
    }

    function testCreationFailsIfExpirationInPast() public {
        vm.startPrank(seller);
        
        vm.expectRevert(bytes("Expiration date must be in the future"));
        optionManager.creation(asset, amountAsset, strikePrice, premium, block.timestamp - 1);
        
        vm.stopPrank();
    }

    function testCreationFailsIfInvalidAmountAsset() public {
        vm.startPrank(seller);
        
        vm.expectRevert(bytes("Amount must be greater than 0"));
        optionManager.creation(asset, 0, strikePrice, premium, expiration);
        
        vm.stopPrank();
    }

    function testCreationFailsIfInvalidStrikePrice() public {
        vm.startPrank(seller);
        
        vm.expectRevert(bytes("Amount must be greater than 0"));
        optionManager.creation(asset, amountAsset, 0, premium, expiration);
        
        vm.stopPrank();
    }
    
    function testCreationFailsIfInvalidPremium() public {
        vm.startPrank(seller);
        
        vm.expectRevert(bytes("Amount must be greater than 0"));
        optionManager.creation(asset, amountAsset, strikePrice, 0, expiration);
        
        vm.stopPrank();
    }

    function testCreationFailsIfAssetIsZeroAddress() public {
        vm.startPrank(seller);
        
        vm.expectRevert(bytes("Asset address must be valid"));
        optionManager.creation(address(0), amountAsset, strikePrice, premium, expiration);
        
        vm.stopPrank();
    }

    function testCreationFailsIfTokenTransferFails() public {
        vm.startPrank(seller);
        
        IERC20(exchangeToken).approve(address(optionManager), strikePrice);
        deal(address(exchangeToken), seller, 0);

        vm.expectRevert();
        optionManager.creation(asset, amountAsset, strikePrice, premium, expiration);
        
        vm.stopPrank();
    }
}
