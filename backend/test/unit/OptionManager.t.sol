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

	modifier m_createPutOption{
        vm.prank(seller);
        optionManager.createOptionPut(
            1_000e18,
            50e18,
            block.timestamp + 1 days,
            address(asset),
            10e18
        );
        _;
    }

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

		// Mint asset for buyer
		asset.mint(buyer, 10e18);
        vm.prank(buyer);
        asset.approve(address(optionManager), 10e18);
    }

	function testCreatePutOption() public m_createPutOption {
    
<<<<<<< HEAD
        (OptionManager.OptionType optionType, address optionSeller,, uint256 strikePrice,,,,,) = optionManager.options(0);
=======
        (OptionManager.OptionType optionType, address optionSeller,, uint256 strikePrice,,,,,,) = optionManager.options(0);
>>>>>>> 5d4c57966ae89f84472d7082b8058b689fbae520
        
        assertEq(uint256(optionType), 0); // Ensure it's a PUT
        assertEq(optionSeller, seller);
        assertEq(strikePrice, 1_000e18);
    }

	function testBuyPutOption() public m_createPutOption {

        // Buyer buys the option
        vm.prank(buyer);
        optionManager.buyOption(0);

        (, , address optionBuyer,,,,,,) = optionManager.options(0);
        assertEq(optionBuyer, buyer);
        assertEq(usdc.balanceOf(seller), 4_050e18);
    }

    function testSendAssetToContract() public m_createPutOption {

		// Buyer buys the option and transfer the asset
        vm.prank(buyer);
        optionManager.buyOption(0);
        vm.prank(buyer);
        optionManager.sendAssetToContract(0);

        (, , , , , , , , bool assetTransferred) = optionManager.options(0);
        assertEq(assetTransferred, true);
        assertEq(asset.balanceOf(buyer), 0);
    }

    function testReclaimAssetBeforeExpiry() public m_createPutOption {

        vm.prank(buyer);
        optionManager.buyOption(0);

        vm.prank(buyer);
        optionManager.sendAssetToContract(0);

        // Reclaim asset
        vm.prank(buyer);
        optionManager.reclaimAssetFromContract(0);

        (, , , , , , , , bool assetTransferred) = optionManager.options(0);
        assertEq(assetTransferred, false);
		assertEq(asset.balanceOf(buyer), 10e18);
    }

    function testDeleteOptionBeforePurchase() public m_createPutOption {

        vm.prank(seller);
        optionManager.deleteOptionPut(0);

        // Ensure option was deleted
        // vm.expectRevert();
        vm.prank(buyer);
        optionManager.buyOption(0);
    }
}
