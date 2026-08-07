// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AuthenticityRegistry
 * @dev Stores cryptographic SHA-256 file hashes and Deep Learning predictions on-chain.
 * Only lightweight hashes and short prediction strings are recorded to minimize gas fees.
 */
contract AuthenticityRegistry {
    
    struct Record {
        bytes32 fileHash;
        address owner;
        uint256 timestamp;
        string prediction; // "REAL" or "FAKE"
        bool verified;
    }

    /// @notice Mapping from SHA-256 file hash to transaction Record
    mapping(bytes32 => Record) public records;

    /// @notice Emitted whenever a new file hash is registered on-chain
    event FileRegistered(
        bytes32 indexed fileHash,
        address indexed owner,
        string prediction,
        uint256 timestamp
    );

    /**
     * @notice Registers a new file hash and its deep learning verification result on-chain.
     * @param _fileHash The SHA-256 hash of the media file as bytes32
     * @param _prediction The deep learning classification string ("REAL" or "FAKE")
     */
    function registerFile(bytes32 _fileHash, string calldata _prediction) external {
        require(_fileHash != bytes32(0), "AuthenticityRegistry: Invalid zero hash");
        require(!records[_fileHash].verified, "AuthenticityRegistry: File hash already registered on-chain");
        require(
            keccak256(bytes(_prediction)) == keccak256(bytes("REAL")) ||
            keccak256(bytes(_prediction)) == keccak256(bytes("FAKE")),
            "AuthenticityRegistry: prediction must be 'REAL' or 'FAKE'"
        );

        records[_fileHash] = Record({
            fileHash: _fileHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            prediction: _prediction,
            verified: true
        });

        emit FileRegistered(_fileHash, msg.sender, _prediction, block.timestamp);
    }

    /**
     * @notice Verifies whether a given SHA-256 file hash exists on-chain.
     * @param _fileHash SHA-256 file hash to query
     * @return exists True if registered
     * @return owner Wallet address of the registrar
     * @return timestamp Unix timestamp of registration
     * @return prediction "REAL" or "FAKE" classification recorded at registration
     */
    function verifyFile(bytes32 _fileHash) external view returns (
        bool exists,
        address owner,
        uint256 timestamp,
        string memory prediction
    ) {
        Record memory rec = records[_fileHash];
        return (rec.verified, rec.owner, rec.timestamp, rec.prediction);
    }
}
