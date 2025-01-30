// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/OptionManager.sol";

contract DeployFactory is Script {
    function run() external {
        vm.startBroadcast();

        address exchangeToken = 0xf08A50178dfcDe18524640EA6618a1f965821715;
        address linkToken = 0x779877A7B0D9E8603169DdbD7836e478b4624789;

        OptionManager optionManager = new OptionManager(exchangeToken, linkToken);

        console.log("OptionManager deployed at:", address(optionManager));
        
        vm.stopBroadcast();
    }
}
