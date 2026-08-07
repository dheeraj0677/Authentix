// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IAuthenticityRegistry
 * @dev Canonical interface for the Authentix registry system.
 *      Any contract implementing this interface is a valid drop-in for all clients.
 *
 *      BACKWARD-COMPATIBILITY GUARANTEE:
 *      - registerFile() signature is identical to AuthenticityRegistry.sol
 *      - verifyFile() return tuple is identical to AuthenticityRegistry.sol
 *      - FileRegistered event signature is identical to AuthenticityRegistry.sol
 *
 *      Clients (MetaMask, web3_client.py, React) require ZERO code changes.
 *      Only the deployed contract address needs to be updated.
 */
interface IAuthenticityRegistry {

    // -----------------------------------------------------------------------
    // Events — identical signatures to original AuthenticityRegistry.sol
    // -----------------------------------------------------------------------

    /// @notice Emitted on every new file hash registration. Identical to v1 signature.
    event FileRegistered(
        bytes32 indexed fileHash,
        address indexed owner,
        string prediction,
        uint256 timestamp
    );

    /// @notice Emitted when media details are registered on-chain
    event MediaRegistered(
        bytes32 indexed fileHash,
        address indexed owner,
        string  fileType,
        string  filename,
        uint256 fileSizeBytes,
        uint256 timestamp
    );

    /// @notice Emitted when a verification query is logged
    event VerificationCompleted(
        bytes32 indexed fileHash,
        address indexed verifier,
        string  prediction,
        uint8   confidenceScore,
        string  modelVersion,
        uint256 timestamp
    );

    /// @notice Emitted when media ownership is transferred to a new wallet
    event OwnershipChanged(
        bytes32 indexed fileHash,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    /// @notice Emitted when a file verification attempt fails (not registered or hash mismatch)
    event VerificationFailed(
        bytes32 indexed fileHash,
        address indexed verifier,
        string  reason,
        uint256 timestamp
    );

    /// @notice Emitted when media content modifications are detected or registered
    event MediaModified(
        bytes32 indexed originalFileHash,
        bytes32 indexed modifiedFileHash,
        address indexed actor,
        string  modificationType,
        uint256 timestamp
    );

    /// @notice Emitted when media is reverified at a subsequent stage
    event MediaReverified(
        bytes32 indexed fileHash,
        address indexed verifier,
        string  prediction,
        uint8   confidenceScore,
        uint256 reverificationCount,
        uint256 timestamp
    );

    /// @notice Emitted when a Deep Learning model version is updated or deployed
    event ModelUpdated(
        string indexed modelVersion,
        string indexed datasetVersion,
        uint256 timestamp
    );

    // -----------------------------------------------------------------------
    // Core Functions — backward-compatible API
    // -----------------------------------------------------------------------

    /**
     * @notice Registers a SHA-256 file hash and deep learning prediction on-chain.
     * @param _fileHash  SHA-256 hash of the media file as bytes32 (0x-prefixed)
     * @param _prediction Deep learning verdict: exactly "REAL" or "FAKE"
     */
    function registerFile(bytes32 _fileHash, string calldata _prediction) external;

    /**
     * @notice Verifies a file hash against on-chain records.
     * @dev Returns exact same 4-tuple as AuthenticityRegistry.verifyFile() for
     *      zero-change compatibility with existing web3_client.py and wallet.js.
     * @param _fileHash SHA-256 hash to query
     * @return exists     True if the hash is registered
     * @return fileOwner  Wallet address that registered this hash
     * @return timestamp  Unix epoch of registration (block.timestamp)
     * @return prediction "REAL" or "FAKE" as stored at registration
     */
    function verifyFile(bytes32 _fileHash) external view returns (
        bool exists,
        address fileOwner,
        uint256 timestamp,
        string memory prediction
    );
}
