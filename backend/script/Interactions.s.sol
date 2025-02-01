// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {ERC20Mock} from "../src/mocks/ERC20mock.sol";
import {OptionManager} from "../src/OptionManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract BuyPut is Script {

	error BuyPut_invalidChainName();

	/* State Variables */
	address public SELLER = 0x4d7233Cab735078318ac948b1400fBe660048830;
	address public BUYER = 0xD2C2011d8c700094712C43435d16E3A9703e7F96;
    
	OptionManager private optionManager;
	IERC20 private usdc;
	IERC20 private fight_token;
	
	address private constant FIGHT_TOKEN_ADDRESS = 0x6e6aD3E15a255A1fAfbF19C2EC2426147071CA0C; //FightToken ERC20
	uint256 public constant ASSET_AMOUNT = 1;

	uint256 public constant STRIKE_PRICE = 1e5; //0.1 USDC
	uint256 public constant PREMIUM = 1e4; //0.01 USDC
	uint256 public immutable EXPIRY;

    // uint256 public constant SELLER_STARTING_BALANCE = 20e18;
    // uint256 public constant BUYER_STARTING_BALANCE = 20e18;

	constructor() {
		EXPIRY = block.timestamp + 5*60;
	}

	function run() external {
        buyPutOption();
    }

	function buyPutOption() public {
		HelperConfig helperConfig = new HelperConfig();
		HelperConfig.NetworkConfig memory networkconfig = helperConfig.getActiveNetworkConfig();

		if (block.chainid == 11155111) {
			console.log("Working on :", networkconfig.networkName);

            address optionManagerContractAddress = networkconfig.optionManagerContractAddress;
            optionManager = OptionManager(payable(optionManagerContractAddress));

            address usdcAddress = networkconfig.usdc_address;
            usdc = IERC20(usdcAddress);
			fight_token = IERC20(FIGHT_TOKEN_ADDRESS);
            // console.log("INIT Seller USDC balance:", usdc.balanceOf(SELLER));
            // console.log("INIT Buyer USDC balance:", usdc.balanceOf(BUYER));
            // console.log("INIT Contract USDC balance:", usdc.balanceOf(optionManagerContractAddress));
            // console.log("INIT Buyer FightToken balance:", fight_token.balanceOf(BUYER));
			
			// vm.startBroadcast(SELLER);
            // usdc.approve(optionManagerContractAddress, STRIKE_PRICE);
			// optionManager.createOptionPut(STRIKE_PRICE, PREMIUM, EXPIRY, FIGHT_TOKEN_ADDRESS, ASSET_AMOUNT);
			// vm.stopBroadcast();

            // console.log("Seller USDC balance:", usdc.balanceOf(SELLER));
            // console.log("Contract USDC balance:", usdc.balanceOf(optionManagerContractAddress));

			vm.startBroadcast(BUYER);
            usdc.approve(optionManagerContractAddress, PREMIUM);
			optionManager.buyOption(4);
            usdc.approve(optionManagerContractAddress, PREMIUM);
			optionManager.buyOption(5);
			vm.stopBroadcast();

			// console.log("Seller USDC balance:", usdc.balanceOf(SELLER));
            // console.log("Buyer USDC balance:", usdc.balanceOf(BUYER));

			// vm.startBroadcast(BUYER);
            // fight_token.approve(optionManagerContractAddress, ASSET_AMOUNT);
			// optionManager.sendAssetToContract(2);
			// vm.stopBroadcast();

			// console.log("Buyer FightToken balance:", fight_token.balanceOf(BUYER));
			// console.log("Seller FightToken balance:", fight_token.balanceOf(SELLER));
			// console.log("Contract FightToken balance:", fight_token.balanceOf(optionManagerContractAddress));
		
		}
		else if (block.chainid == 31337) {
			console.log("Working on :", networkconfig.networkName);
			
            // vm.deal(BUYER1, 10 ether);

            // vm.startBroadcast();
	        // FightToken fightToken = new FightToken(FIGHTER1);
			// CustomERC20Mock mockUSDC = new CustomERC20Mock(6);
            // mockUSDC.mint(BUYER1, BUYER_STARTING_BALANCE); // Mint 5000 USDC to BUYER1
            // vm.stopBroadcast();
		
			// vm.startBroadcast(fightToken.getOwner());
			// fightToken.whitelistStablecoin(address(mockUSDC), true);
			// vm.stopBroadcast();

			// vm.startBroadcast(BUYER1);
			// mockUSDC.approve(address(fightToken), TOKEN_PRICE_USDC * PURCHASE_AMOUNT);
			// fightToken.buyToken(PURCHASE_AMOUNT, address(mockUSDC));
			// vm.stopBroadcast();

			// console.log("Buyer USDC balance:", mockUSDC.balanceOf(BUYER1));
            // console.log("Contract USDC balance:", mockUSDC.balanceOf(address(fightToken)));
            // console.log("Buyer FightToken balance:", fightToken.balanceOf(BUYER1));

            // vm.startBroadcast(fightToken.getOwner());
			// fightToken.withdrawFundToTheFighter(address(mockUSDC));
			// vm.stopBroadcast();

            // console.log("Fighter USDC balance:", mockUSDC.balanceOf(FIGHTER1));
		}
		else {
			revert BuyPut_invalidChainName();
		}

	}
}