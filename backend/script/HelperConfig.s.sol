// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {

	error HelperConfig_invalidChainID();

	NetworkConfig private activeNetworkconfig;

	struct NetworkConfig {
		string networkName;
		address usdc_address;
		address account;
		address optionManagerContractAddress;
	}

	constructor () {
		if (block.chainid == 11155111) {
			activeNetworkconfig = getSepoliaEthConfig();
		}
		else if (block.chainid == 31337) {
			activeNetworkconfig = getOrCreateAnvilEthConfig();
		}
		else {
			revert HelperConfig_invalidChainID();
		}
	}

	function getSepoliaEthConfig() public pure returns(NetworkConfig memory) {
		NetworkConfig memory sepoliaNetworkConfig = NetworkConfig({
			networkName: "Sepolia",
			usdc_address: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238,
			account: 0x4d7233Cab735078318ac948b1400fBe660048830,
			optionManagerContractAddress: 0x6c147038AeB487D054E54585DE106Cb35d5ddF6f
		});
		return sepoliaNetworkConfig;
	}

	function getOrCreateAnvilEthConfig() public pure returns(NetworkConfig memory) {
		NetworkConfig memory anvilNetworkConfig = NetworkConfig({
			networkName: "Anvil",
			usdc_address: 0x0000000000000000000000000000000000000000,
			account: 0x4d7233Cab735078318ac948b1400fBe660048830,
			optionManagerContractAddress: 0x6c147038AeB487D054E54585DE106Cb35d5ddF6f
		});
		return anvilNetworkConfig;
	}
	
	function getActiveNetworkConfig() public view returns(NetworkConfig memory) {
		return activeNetworkconfig;
	}
}