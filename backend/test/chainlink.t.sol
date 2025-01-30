// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console2} from "forge-std/Test.sol";
import {OptionManager} from "../src/OptionManager.sol";
import {MockERC20} from "./mockERC20.sol";

contract ChainlinkTest is Test {
    OptionManager public optionManager;
    MockERC20 public mockAsset;
    MockERC20 public mockExchangeToken;
    MockERC20 public mockLink;
    
    address public constant CHAINLINK_FORWARDER = 0x215Bae55aDFafEa110814c2c05011F316F9BA73b; // Replace with actual forwarder
    address public constant REGISTRY = 0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad; // Replace with actual registry
    address public constant REGISTRAR = 0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976; // Replace with actual registrar
    
    address public seller = address(1);
    address public buyer = address(2);
    uint256 public constant INITIAL_BALANCE = 1000 ether;
    
    function setUp() public {
        mockAsset = new MockERC20("Mock Asset", "MASSET", 18);
        mockExchangeToken = new MockERC20("Mock Exchange Token", "MEXT", 18);
        mockLink = new MockERC20("Mock Link", "MLINK", 18);
        
        optionManager = new OptionManager(
            address(mockExchangeToken),
            address(mockLink)
        );
        
        optionManager.setForwarder(CHAINLINK_FORWARDER);
        optionManager.setRegistry(REGISTRY);
        optionManager.setRegistrar(REGISTRAR);
        
        mockAsset.mint(seller, INITIAL_BALANCE);
        mockAsset.mint(buyer, INITIAL_BALANCE);
        mockExchangeToken.mint(seller, INITIAL_BALANCE);
        mockExchangeToken.mint(buyer, INITIAL_BALANCE);
        mockLink.mint(address(this), INITIAL_BALANCE);
        
        vm.startPrank(seller);
        mockAsset.approve(address(optionManager), INITIAL_BALANCE);
        mockExchangeToken.approve(address(optionManager), INITIAL_BALANCE);
        vm.stopPrank();
        
        vm.startPrank(buyer);
        mockAsset.approve(address(optionManager), INITIAL_BALANCE);
        mockExchangeToken.approve(address(optionManager), INITIAL_BALANCE);
        vm.stopPrank();
        
        mockLink.approve(address(optionManager), INITIAL_BALANCE);
        optionManager.fundUpkeep(10 ether);
    }

    function testCheckUpkeepNoExpiredOptions() public view {
        (bool upkeepNeeded, ) = optionManager.checkUpkeep("");
        assertFalse(upkeepNeeded, "Should not need upkeep when no options exist");
    }

    function testCheckUpkeepWithExpiredOption() public {
        uint256 strikePrice = 100 ether;
        uint256 premium = 10 ether;
        uint256 amountAsset = 1 ether;
        uint256 expirationTime = block.timestamp + 1;

        vm.startPrank(seller);
        optionManager.creation(
            address(mockAsset),
            amountAsset,
            strikePrice,
            premium,
            expirationTime
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 2);

        (bool upkeepNeeded, bytes memory performData) = optionManager.checkUpkeep("");
        assertTrue(upkeepNeeded, "Should need upkeep for expired option");
        
        uint256 decodedId = abi.decode(performData, (uint256));
        assertEq(decodedId, 0, "Perform data should contain first option ID");
    }

    function testPerformUpkeep() public {
        uint256 strikePrice = 1000;
        uint256 premium = 10;
        uint256 amountAsset = 1;
        uint256 expirationTime = block.timestamp + 1;
        
        uint assetAmountBeforeSeller = mockAsset.balanceOf(seller);
        uint exchangeTokenAmountBeforeBuyer = mockExchangeToken.balanceOf(buyer);
        
        vm.startPrank(seller);
        optionManager.creation(
            address(mockAsset),
            amountAsset,
            strikePrice,
            premium,
            expirationTime
        );
        vm.stopPrank();

        vm.startPrank(buyer);
        optionManager.purchase(0);
        optionManager.depositAsset(0);
        vm.stopPrank();

        vm.warp(block.timestamp + 2);

        (bool upkeepNeeded, bytes memory performData) = optionManager.checkUpkeep("");
        if (upkeepNeeded) {
            vm.startPrank(CHAINLINK_FORWARDER);
            optionManager.performUpkeep(performData);
            vm.stopPrank();
        }

        uint assetAmountAfterSeller = mockAsset.balanceOf(seller);
        uint exchangeTokenAmountAfterBuyer = mockExchangeToken.balanceOf(buyer);

        assertEq(assetAmountAfterSeller - assetAmountBeforeSeller, amountAsset, "Seller should receive asset");
        assertEq(exchangeTokenAmountAfterBuyer - exchangeTokenAmountBeforeBuyer, strikePrice - premium, "Buyer should receive strike price");
    }
}