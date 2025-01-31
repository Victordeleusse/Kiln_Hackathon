// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {OptionManager} from "../src/OptionManager.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {ERC20Mock} from "../src/mocks/ERC20mock.sol";

contract DeployOptionManager is Script {

	function run() external {
		deployOptionManager();
	}

	function deployOptionManager() public returns (OptionManager, HelperConfig, address) {
		HelperConfig helperConfig = new HelperConfig();
		HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();
		console.log("Working on Network: ", networkConfig.networkName);
		address usdcAddress = networkConfig.usdc_address;
		if (usdcAddress == address(0)) {
            vm.startBroadcast();
            ERC20Mock usdcMock = new ERC20Mock("Mock USDC", "USDC");
            vm.stopBroadcast();
            usdcAddress = address(usdcMock);
        }

		vm.startBroadcast(networkConfig.account);
		OptionManager optionManager = new OptionManager(usdcAddress);
		vm.stopBroadcast();
		
		return (optionManager, helperConfig, usdcAddress);
	}
}