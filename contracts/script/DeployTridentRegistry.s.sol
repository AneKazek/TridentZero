// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TridentRegistry} from "../src/TridentRegistry.sol";

contract DeployTridentRegistry is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        TridentRegistry registry = new TridentRegistry();

        console.log("TridentRegistry deployed to:", address(registry));

        vm.stopBroadcast();
    }
}
