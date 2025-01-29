// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/OptionManager.sol";

contract DeployFactory is Script {
    function run() external {
        vm.startBroadcast();

        address exchangeToken = 0xf08A50178dfcDe18524640EA6618a1f965821715;

        OptionManager optionManager = new OptionManager(exchangeToken);

        console.log("OptionManager deployed at:", address(optionManager));
        
        vm.stopBroadcast();
    }
}
