// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IAuthenticityRegistry.sol";
import "./infrastructure/VersionManager.sol";
import "./registries/MediaRegistry.sol";
import "./registries/OwnershipRegistry.sol";
import "./registries/VerificationRegistry.sol";
import "./registries/VerificationLog.sol";

/**
 * @title RegistryController
 * @dev Backward-compatible entry point for the Authentix modular blockchain system.
 *
 *      Architecture role: FAÇADE / COORDINATOR
 *
 *      This is the ONLY contract address that external clients ever need.
 *      MetaMask, web3_client.py, and the React frontend all point here.
 *      This address NEVER changes — only module addresses inside VersionManager
 *      are updated during upgrades.
 *
 *      BACKWARD COMPATIBILITY GUARANTEE:
 *        registerFile(bytes32, string)          → identical to AuthenticityRegistry.sol
 *        verifyFile(bytes32) → (bool,addr,uint,string) → identical return tuple
 *        FileRegistered event                   → identical signature
 *
 *      NEW FUNCTIONS (additive — do not break existing clients):
 *        registerFileEnhanced() — full metadata registration from backend
 *        verifyAndLog()         — verifyFile() + audit log entry
 *        getFullRecord()        — enriched record from all 4 modules
 *        transferFileOwnership() — transfer file ownership to new wallet
 *        getFilesByWallet()     — on-chain wallet history lookup
 *        getFileAuditLog()      — full audit trail for a file hash
 *
 *      Module resolution:
 *        RegistryController never hardcodes module addresses.
 *        All module addresses are resolved at call-time via VersionManager.
 *        This allows any module to be upgraded without redeploying this contract.
 */
contract RegistryController is IAuthenticityRegistry {

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    /// @notice Version of this RegistryController
    string public constant VERSION = "2.0.0";

    /// @notice Default model version tag when not provided by caller
    string public constant DEFAULT_MODEL_VERSION = "EfficientNetB0-v1.0.0";

    // -----------------------------------------------------------------------
    // Data Structures
    // -----------------------------------------------------------------------

    /**
     * @notice Enriched record aggregating all 4 module registries.
     *         Returned by getFullRecord() — not available in AuthenticityRegistry v1.
     */
    struct FullRecord {
        // ---- Identity ----
        bytes32 fileHash;
        bool    exists;

        // ---- MediaRegistry fields ----
        string  fileType;
        string  filename;
        uint256 uploadTimestamp;
        uint256 fileSizeBytes;

        // ---- OwnershipRegistry fields ----
        address currentOwner;
        address originalRegistrar;
        uint256 registrationTimestamp;
        uint256 lastTransferTimestamp;
        bool    isActive;

        // ---- VerificationRegistry fields ----
        string  prediction;
        uint8   confidenceScore;
        string  modelVersion;
        uint256 verifiedAt;
    }

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    /// @notice Contract owner — can call admin functions
    address public owner;

    /// @notice Reference to VersionManager for module address resolution
    VersionManager public versionManager;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event OwnershipTransferredOnChain(
        bytes32 indexed fileHash,
        address indexed fromOwner,
        address indexed toOwner,
        uint256         timestamp
    );

    event VersionManagerUpdated(
        address indexed oldVersionManager,
        address indexed newVersionManager
    );

    // -----------------------------------------------------------------------
    // Modifiers
    // -----------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "RegistryController: caller is not owner");
        _;
    }

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    /**
     * @param _versionManager Address of the deployed VersionManager contract
     */
    constructor(address _versionManager) {
        require(_versionManager != address(0), "RegistryController: invalid VersionManager address");
        owner          = msg.sender;
        versionManager = VersionManager(_versionManager);
    }

    // -----------------------------------------------------------------------
    // Internal — Module Resolution
    // -----------------------------------------------------------------------

    /// @dev Resolves MediaRegistry address from VersionManager at call time
    function _media() internal view returns (MediaRegistry) {
        return MediaRegistry(versionManager.getModuleAddress("MediaRegistry"));
    }

    /// @dev Resolves OwnershipRegistry address from VersionManager at call time
    function _ownership() internal view returns (OwnershipRegistry) {
        return OwnershipRegistry(versionManager.getModuleAddress("OwnershipRegistry"));
    }

    /// @dev Resolves VerificationRegistry address from VersionManager at call time
    function _verification() internal view returns (VerificationRegistry) {
        return VerificationRegistry(versionManager.getModuleAddress("VerificationRegistry"));
    }

    /// @dev Resolves VerificationLog address from VersionManager at call time
    function _log() internal view returns (VerificationLog) {
        return VerificationLog(versionManager.getModuleAddress("VerificationLog"));
    }

    // -----------------------------------------------------------------------
    // IAuthenticityRegistry — Backward-Compatible Core API
    // -----------------------------------------------------------------------

    /**
     * @notice Registers a file hash and deep learning prediction on-chain.
     * @dev BACKWARD-COMPATIBLE: identical signature to AuthenticityRegistry.registerFile().
     *      Called directly by MetaMask via wallet.js registerFileOnChainMetaMask().
     *      Uses default values for media metadata (empty strings, 0 size).
     * @param _fileHash   SHA-256 hash as bytes32
     * @param _prediction "REAL" or "FAKE"
     */
    function registerFile(
        bytes32         _fileHash,
        string calldata _prediction
    ) external override {
        _registerInternal(
            _fileHash,
            _prediction,
            0,                      // confidenceScore — unknown when called from MetaMask
            DEFAULT_MODEL_VERSION,  // modelVersion — default
            "",                     // fileType — unknown from frontend
            "",                     // filename — unknown from frontend
            0                       // fileSizeBytes — unknown from frontend
        );
    }

    /**
     * @notice Verifies a file hash against all module registries.
     * @dev BACKWARD-COMPATIBLE: returns identical 4-tuple to AuthenticityRegistry.verifyFile().
     *      web3_client.py calls this as .call() — zero code change required.
     * @param _fileHash SHA-256 hash to query
     * @return exists      True if the hash is registered
     * @return fileOwner   Current owner wallet address
     * @return timestamp   Unix epoch of initial registration
     * @return prediction  "REAL" or "FAKE"
     */
    function verifyFile(
        bytes32 _fileHash
    ) external view override returns (
        bool           exists,
        address        fileOwner,
        uint256        timestamp,
        string memory  prediction
    ) {
        (
            address currentOwner,
            ,            // originalRegistrar — not needed for backward compat
            uint256 regTimestamp,
            ,            // lastTransferTimestamp
            bool    isActive
        ) = _ownership().getOwner(_fileHash);

        (
            string memory pred,
            ,            // confidenceScore
            ,            // modelVersion
            ,            // verifiedAt
            bool verExists
        ) = _verification().getVerification(_fileHash);

        exists     = isActive && verExists;
        fileOwner  = currentOwner;
        timestamp  = regTimestamp;
        prediction = pred;
    }

    // -----------------------------------------------------------------------
    // Enhanced Registration (additive — does not break existing clients)
    // -----------------------------------------------------------------------

    /**
     * @notice Full-metadata registration called by the Python backend.
     * @dev Stores complete file info in all 4 registries.
     *      Emits the same FileRegistered event for backward compatibility.
     * @param _fileHash        SHA-256 hash as bytes32
     * @param _prediction      "REAL" or "FAKE"
     * @param _confidenceScore AI confidence 0–100 (uint8)
     * @param _modelVersion    e.g. "EfficientNetB0-v1.0.0"
     * @param _fileType        MIME type e.g. "image/jpeg"
     * @param _filename        Sanitized filename
     * @param _fileSizeBytes   File size in bytes
     */
    function registerFileEnhanced(
        bytes32         _fileHash,
        string calldata _prediction,
        uint8           _confidenceScore,
        string calldata _modelVersion,
        string calldata _fileType,
        string calldata _filename,
        uint256         _fileSizeBytes
    ) external {
        _registerInternal(
            _fileHash,
            _prediction,
            _confidenceScore,
            _modelVersion,
            _fileType,
            _filename,
            _fileSizeBytes
        );
    }

    /**
     * @dev Internal registration logic shared by registerFile() and registerFileEnhanced().
     */
    function _registerInternal(
        bytes32       _fileHash,
        string memory _prediction,
        uint8         _confidenceScore,
        string memory _modelVersion,
        string memory _fileType,
        string memory _filename,
        uint256       _fileSizeBytes
    ) internal {
        require(_fileHash != bytes32(0), "RegistryController: invalid zero hash");
        require(
            keccak256(bytes(_prediction)) == keccak256(bytes("REAL")) ||
            keccak256(bytes(_prediction)) == keccak256(bytes("FAKE")),
            "RegistryController: prediction must be 'REAL' or 'FAKE'"
        );
        require(!_media().mediaExists(_fileHash), "RegistryController: file hash already registered on-chain");

        // 1. Store media metadata
        _media().storeMedia(_fileHash, _fileType, _filename, _fileSizeBytes);

        // 2. Record ownership
        _ownership().recordOwnership(_fileHash, msg.sender);

        // 3. Store AI verification verdict
        _verification().storeVerification(_fileHash, _prediction, _confidenceScore, _modelVersion);

        // 4. Log registration in audit trail
        _log().logRegistration(_fileHash, msg.sender, _prediction);

        // 5. Emit backward-compatible and indexed events
        emit FileRegistered(_fileHash, msg.sender, _prediction, block.timestamp);
        emit MediaRegistered(_fileHash, msg.sender, _fileType, _filename, _fileSizeBytes, block.timestamp);
        emit VerificationCompleted(_fileHash, msg.sender, _prediction, _confidenceScore, _modelVersion, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // Verification with Audit Logging (additive)
    // -----------------------------------------------------------------------

    /**
     * @notice Verifies a file hash AND writes a query event to the audit log.
     * @dev Non-view (state-writing) version of verifyFile(). Costs gas but
     *      permanently records that this wallet queried this file at this time.
     *      Use when audit trail of who-verified-what is required.
     * @param _fileHash SHA-256 hash to query
     * @return exists      True if the hash is registered
     * @return fileOwner   Current owner wallet address
     * @return timestamp   Unix epoch of initial registration
     * @return prediction  "REAL" or "FAKE"
     */
    function verifyAndLog(
        bytes32 _fileHash
    ) external returns (
        bool          exists,
        address       fileOwner,
        uint256       timestamp,
        string memory prediction
    ) {
        (
            address currentOwner,
            ,
            uint256 regTimestamp,
            ,
            bool isActive
        ) = _ownership().getOwner(_fileHash);

        (
            string memory pred,
            uint8 conf,
            string memory modelVer,
            ,
            bool verExists
        ) = _verification().getVerification(_fileHash);

        exists     = isActive && verExists;
        fileOwner  = currentOwner;
        timestamp  = regTimestamp;
        prediction = pred;

        // Log the query & emit events
        if (exists) {
            _log().logQuery(_fileHash, msg.sender);
            uint256 revCount = _log().getEventIdsByHash(_fileHash).length;
            emit VerificationCompleted(_fileHash, msg.sender, pred, conf, modelVer, block.timestamp);
            emit MediaReverified(_fileHash, msg.sender, pred, conf, revCount, block.timestamp);
        } else {
            emit VerificationFailed(_fileHash, msg.sender, "File hash not found on-chain", block.timestamp);
        }
    }

    /**
     * @notice Records a media modification event on-chain when a file is edited or re-rendered.
     * @param _originalFileHash SHA-256 hash of the parent original file
     * @param _modifiedFileHash SHA-256 hash of the newly created modified file
     * @param _modificationType e.g. "Cropping", "Compression", "DeepFake Editing"
     */
    function recordMediaModification(
        bytes32         _originalFileHash,
        bytes32         _modifiedFileHash,
        string calldata _modificationType
    ) external {
        require(_originalFileHash != bytes32(0), "RegistryController: invalid original hash");
        require(_modifiedFileHash != bytes32(0), "RegistryController: invalid modified hash");

        _log().logQuery(_originalFileHash, msg.sender);
        emit MediaModified(_originalFileHash, _modifiedFileHash, msg.sender, _modificationType, block.timestamp);
    }

    /**
     * @notice Emits a ModelUpdated event when a DL model is retrained or updated.
     * @param _modelVersion  e.g. "EfficientNetB0-v1.1.0"
     * @param _datasetVersion e.g. "FF++_CelebDF_v2.0"
     */
    function emitModelUpdated(string calldata _modelVersion, string calldata _datasetVersion) external onlyOwner {
        emit ModelUpdated(_modelVersion, _datasetVersion, block.timestamp);
    }


    // -----------------------------------------------------------------------
    // Enriched Read (additive)
    // -----------------------------------------------------------------------

    /**
     * @notice Returns a fully enriched record aggregating all 4 module registries.
     * @dev NEW function — not in AuthenticityRegistry.sol. Provides all metadata
     *      in one call, eliminating multiple round-trips for the frontend.
     * @param _fileHash SHA-256 hash to query
     * @return rec FullRecord struct with all module data
     */
    function getFullRecord(bytes32 _fileHash) external view returns (FullRecord memory rec) {
        (
            string memory fileType,
            string memory filename,
            uint256 uploadTimestamp,
            uint256 fileSizeBytes,
            bool mediaExists
        ) = _media().getMedia(_fileHash);

        (
            address currentOwner,
            address originalRegistrar,
            uint256 regTimestamp,
            uint256 lastTransferTs,
            bool isActive
        ) = _ownership().getOwner(_fileHash);

        (
            string memory prediction,
            uint8   confidenceScore,
            string memory modelVersion,
            uint256 verifiedAt,
            bool verExists
        ) = _verification().getVerification(_fileHash);

        rec = FullRecord({
            fileHash:              _fileHash,
            exists:                isActive && verExists && mediaExists,
            fileType:              fileType,
            filename:              filename,
            uploadTimestamp:       uploadTimestamp,
            fileSizeBytes:         fileSizeBytes,
            currentOwner:          currentOwner,
            originalRegistrar:     originalRegistrar,
            registrationTimestamp: regTimestamp,
            lastTransferTimestamp: lastTransferTs,
            isActive:              isActive,
            prediction:            prediction,
            confidenceScore:       confidenceScore,
            modelVersion:          modelVersion,
            verifiedAt:            verifiedAt
        });
    }

    // -----------------------------------------------------------------------
    // Ownership Transfer (additive)
    // -----------------------------------------------------------------------

    /**
     * @notice Transfers ownership of a registered file to a new wallet.
     * @dev Verifies that msg.sender is the current owner before delegating.
     * @param _fileHash  SHA-256 hash of the file to transfer
     * @param _newOwner  New owner wallet address
     */
    function transferFileOwnership(bytes32 _fileHash, address _newOwner) external {
        require(_newOwner != address(0), "RegistryController: invalid new owner address");

        address currentOwner = _ownership().getCurrentOwner(_fileHash);
        require(currentOwner != address(0), "RegistryController: file not registered");
        require(currentOwner == msg.sender, "RegistryController: caller is not current owner");
        require(_newOwner != msg.sender,    "RegistryController: new owner must differ from caller");

        // Delegate transfer to OwnershipRegistry
        _ownership().transferOwnership(_fileHash, _newOwner);

        // Log transfer in audit trail
        string memory meta = string(abi.encodePacked("to:", _toHexString(uint160(_newOwner), 20)));
        _log().logOwnershipTransfer(_fileHash, msg.sender, meta);

        emit OwnershipTransferredOnChain(_fileHash, msg.sender, _newOwner, block.timestamp);
        emit OwnershipChanged(_fileHash, msg.sender, _newOwner, block.timestamp);
    }


    // -----------------------------------------------------------------------
    // Wallet & Audit Queries (additive)
    // -----------------------------------------------------------------------

    /**
     * @notice Returns all file hashes registered by or transferred to a wallet.
     * @dev Enables on-chain wallet history — supplements/replaces backend DB.
     * @param _wallet Wallet address to query
     * @return Array of bytes32 file hashes
     */
    function getFilesByWallet(address _wallet) external view returns (bytes32[] memory) {
        return _ownership().getFilesByWallet(_wallet);
    }

    /**
     * @notice Returns the full audit log for a file hash (all event IDs).
     * @param _fileHash SHA-256 hash to query
     * @return Array of event IDs for this file
     */
    function getFileAuditLog(bytes32 _fileHash) external view returns (uint256[] memory) {
        return _log().getEventIdsByHash(_fileHash);
    }

    /**
     * @notice Returns full event data arrays for a file hash.
     * @param _fileHash SHA-256 hash to query
     */
    function getFileAuditEvents(bytes32 _fileHash) external view returns (
        uint256[] memory eventIds,
        address[] memory actors,
        VerificationLog.EventType[] memory eventTypes,
        uint256[] memory timestamps,
        string[]  memory metadatas
    ) {
        return _log().getEventsByHash(_fileHash);
    }

    /**
     * @notice Returns the total number of events logged across all files.
     */
    function getTotalAuditEventCount() external view returns (uint256) {
        return _log().getTotalEventCount();
    }

    // -----------------------------------------------------------------------
    // Module Version Info (additive)
    // -----------------------------------------------------------------------

    /**
     * @notice Returns current version addresses of all registered modules.
     * @return mediaAddr        MediaRegistry address
     * @return ownershipAddr    OwnershipRegistry address
     * @return verificationAddr VerificationRegistry address
     * @return logAddr          VerificationLog address
     * @return vmAddr           VersionManager address
     */
    function getModuleAddresses() external view returns (
        address mediaAddr,
        address ownershipAddr,
        address verificationAddr,
        address logAddr,
        address vmAddr
    ) {
        return (
            versionManager.getModuleAddress("MediaRegistry"),
            versionManager.getModuleAddress("OwnershipRegistry"),
            versionManager.getModuleAddress("VerificationRegistry"),
            versionManager.getModuleAddress("VerificationLog"),
            address(versionManager)
        );
    }

    // -----------------------------------------------------------------------
    // Admin
    // -----------------------------------------------------------------------

    /**
     * @notice Updates the VersionManager reference. Emergency escape hatch.
     * @param _newVersionManager New VersionManager contract address
     */
    function setVersionManager(address _newVersionManager) external onlyOwner {
        require(_newVersionManager != address(0), "RegistryController: invalid VersionManager address");
        emit VersionManagerUpdated(address(versionManager), _newVersionManager);
        versionManager = VersionManager(_newVersionManager);
    }

    /**
     * @notice Transfers controller ownership to a new address.
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "RegistryController: invalid new owner");
        owner = _newOwner;
    }

    // -----------------------------------------------------------------------
    // Internal Helpers
    // -----------------------------------------------------------------------

    /**
     * @dev Converts a uint to a hex string with a given byte length (for address logging).
     */
    function _toHexString(uint256 value, uint256 byteLen) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * byteLen + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        bytes16 hexChars = "0123456789abcdef";
        for (uint256 i = 2 * byteLen + 1; i >= 2; --i) {
            buffer[i] = hexChars[value & 0xf];
            value >>= 4;
        }
        return string(buffer);
    }
}
