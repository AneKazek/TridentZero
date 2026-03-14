// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {TridentRegistry} from "../src/TridentRegistry.sol";
import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";

contract TridentRegistryTest is Test {
    TridentRegistry public registry;

    uint256 signerKey = 0xA11CE;
    address signer;
    
    bytes32 constant STAMP_TYPEHASH = keccak256("StampDocument(bytes32 documentHash,uint256 nonce,uint256 deadline)");

    function setUp() public {
        registry = new TridentRegistry();
        signer = vm.addr(signerKey);
    }

    function test_stampDocument_success() public {
        bytes32 docHash = keccak256("my_pdf_document");
        uint256 nonce = registry.nonces(signer);
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 structHash = keccak256(abi.encode(STAMP_TYPEHASH, docHash, nonce, deadline));
        
        // EIP712 domain separator
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("TridentZero")),
                keccak256(bytes("1")),
                block.chainid,
                address(registry)
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.expectEmit(true, true, false, true);
        emit TridentRegistry.DocumentStamped(docHash, signer, nonce, block.timestamp);

        registry.stampDocument(docHash, signer, deadline, signature);

        assertTrue(registry.isStamped(docHash));
        assertEq(registry.nonces(signer), nonce + 1);
    }
}
