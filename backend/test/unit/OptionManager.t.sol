// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {OptionManager} from "../../src/OptionManager.sol";
import {DeployOptionManager} from "../../script/DeployOptionManager.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {ERC20Mock} from "../../src/mocks/ERC20mock.sol";

contract TestOptionManager is Test {
	OptionManager private optionManager;
	HelperConfig private helperConfig;
	HelperConfig.NetworkConfig private networkconfig;

    ERC20Mock asset;
	ERC20Mock usdc;

	address seller = address(1);
    address buyer = address(2);

	function setUp() public {
		address usdcAddress;
        asset = new ERC20Mock("Mock Asset", "AST");

		DeployOptionManager deployOptionManager = new DeployOptionManager();
		(optionManager, helperConfig, usdcAddress) = deployOptionManager.deployOptionManager();
		networkconfig = helperConfig.getActiveNetworkConfig();
		usdc = ERC20Mock(usdcAddress);
        
		// Mint USDC for seller
        usdc.mint(seller, 5_000e18);
		vm.prank(seller);
        usdc.approve(address(optionManager), 1_000e18);

		// Mint USDC for buyer
        usdc.mint(buyer, 1_000e18);
		vm.prank(buyer);
        usdc.approve(address(optionManager), 1_000e18);
    }

	function testCreatePutOption() public {
        vm.prank(seller);
        optionManager.createOptionPut(
            1_000e18,
            50e18,
            block.timestamp + 1 days,
            address(asset),
            10e18
        );

        (OptionManager.OptionType optionType, address optionSeller,, uint256 strikePrice,,,,,,) = optionManager.options(0);
        
        assertEq(uint256(optionType), 0); // Ensure it's a PUT
        assertEq(optionSeller, seller);
        assertEq(strikePrice, 1_000e18);
    }
}
