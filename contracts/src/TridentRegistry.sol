// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EIP712} from "openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {Nonces} from "openzeppelin-contracts/contracts/utils/Nonces.sol";

/**
 * @title TridentRegistry
 * @dev Minimal PoC contract for TridentZero document stamping.
 *      Validates EIP-712 signatures to attest document hashes.
 */
contract TridentRegistry is EIP712, Nonces {
    using ECDSA for bytes32;

    // --- Events ---
    event DocumentStamped(
        bytes32 indexed documentHash,
        address indexed signer,
        uint256 nonce,
        uint256 timestamp
    );

    // --- State ---
    // Mapping to track if a document hash has already been stamped
    mapping(bytes32 => bool) public isStamped;

    // --- TypeHashes ---
    bytes32 private constant STAMP_TYPEHASH =
        keccak256("StampDocument(bytes32 documentHash,uint256 nonce,uint256 deadline)");

    // --- Errors ---
    error SignatureExpired();
    error InvalidSignature();
    error DocumentAlreadyStamped();

    constructor() EIP712("TridentZero", "1") {}

    /**
     * @notice Stamps a document hash after verifying the signer's typed data signature.
     * @param documentHash The final SHA-256 hash of the document.
     * @param signer The expected signer address.
     * @param deadline The expiration timestamp for the signature.
     * @param signature The EIP-712 signature from the signer.
     */
    function stampDocument(
        bytes32 documentHash,
        address signer,
        uint256 deadline,
        bytes calldata signature
    ) external {
        if (block.timestamp > deadline) revert SignatureExpired();
        if (isStamped[documentHash]) revert DocumentAlreadyStamped();

        uint256 currentNonce = _useNonce(signer); // This reverts if max nonce reached etc

        bytes32 structHash = keccak256(
            abi.encode(STAMP_TYPEHASH, documentHash, currentNonce, deadline)
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        
        // Recover signer from signature and check equality
        address recoveredSigner = ECDSA.recover(digest, signature);
        if (recoveredSigner != signer) revert InvalidSignature();

        // Mark as stamped
        isStamped[documentHash] = true;

        emit DocumentStamped(documentHash, signer, currentNonce, block.timestamp);
    }
}
