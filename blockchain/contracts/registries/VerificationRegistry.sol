// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VerificationRegistry
 * @dev Stores Deep Learning model verdicts for registered media files.
 *
 *      Architecture role: DATA MODULE (AI Verification concern)
 *
 *      Stores WHAT the AI decided — prediction, confidence, and which model
 *      version made the decision. Logically independent of file metadata
 *      and ownership.
 *
 *      New capabilities over AuthenticityRegistry.sol:
 *        1. Confidence Score: uint8 (0–100) stored on-chain — forensic value
 *        2. Model Version: records which EfficientNetB0 version certified this
 *        3. updateConfidenceScore(): allows re-evaluation updates (not re-registration)
 *
 *      Why uint8 for confidence: Solidity has no floats. 0–100 as uint8 uses
 *      exactly 1 byte of storage. Backend converts float → uint8 via round().
 *
 *      Access control:
 *        - storeVerification():    onlyController
 *        - updateConfidenceScore(): onlyController
 *        - getVerification():      public view
 */
contract VerificationRegistry {

    // -----------------------------------------------------------------------
    // Data Structures
    // -----------------------------------------------------------------------

    struct VerificationRecord {
        bytes32 fileHash;         // SHA-256 content hash
        string  prediction;       // "REAL" or "FAKE" (validated on storage)
        uint8   confidenceScore;  // 0–100 integer representation of AI confidence %
        string  modelVersion;     // e.g. "EfficientNetB0-v1.0.0"
        uint256 verifiedAt;       // block.timestamp of verification
        bool    exists;           // Existence flag
    }

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    /// @notice Mapping from SHA-256 file hash to VerificationRecord
    mapping(bytes32 => VerificationRecord) private _verifications;

    /// @notice RegistryController address — only this can write
    address public controller;

    /// @notice Deployer — can call setController()
    address public owner;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event VerificationStored(
        bytes32 indexed fileHash,
        string          prediction,
        uint8           confidenceScore,
        string          modelVersion,
        uint256         timestamp
    );

    event ConfidenceUpdated(
        bytes32 indexed fileHash,
        uint8           oldScore,
        uint8           newScore,
        uint256         timestamp
    );

    event ControllerUpdated(
        address indexed oldController,
        address indexed newController
    );

    // -----------------------------------------------------------------------
    // Modifiers
    // -----------------------------------------------------------------------

    modifier onlyController() {
        require(msg.sender == controller, "VerificationRegistry: caller is not controller");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "VerificationRegistry: caller is not owner");
        _;
    }

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    constructor(address _controller) {
        require(_controller != address(0), "VerificationRegistry: invalid controller address");
        controller = _controller;
        owner      = msg.sender;
    }

    // -----------------------------------------------------------------------
    // Write Functions (onlyController)
    // -----------------------------------------------------------------------

    /**
     * @notice Stores an AI verification verdict on-chain.
     * @param _fileHash        SHA-256 hash as bytes32
     * @param _prediction      "REAL" or "FAKE" — validated by require
     * @param _confidenceScore 0–100 integer (AI confidence %)
     * @param _modelVersion    Model version string e.g. "EfficientNetB0-v1.0.0"
     */
    function storeVerification(
        bytes32         _fileHash,
        string calldata _prediction,
        uint8           _confidenceScore,
        string calldata _modelVersion
    ) external onlyController {
        require(_fileHash != bytes32(0), "VerificationRegistry: invalid zero hash");
        require(!_verifications[_fileHash].exists, "VerificationRegistry: verification already stored for this hash");
        require(
            keccak256(bytes(_prediction)) == keccak256(bytes("REAL")) ||
            keccak256(bytes(_prediction)) == keccak256(bytes("FAKE")),
            "VerificationRegistry: prediction must be 'REAL' or 'FAKE'"
        );

        _verifications[_fileHash] = VerificationRecord({
            fileHash:        _fileHash,
            prediction:      _prediction,
            confidenceScore: _confidenceScore,
            modelVersion:    _modelVersion,
            verifiedAt:      block.timestamp,
            exists:          true
        });

        emit VerificationStored(_fileHash, _prediction, _confidenceScore, _modelVersion, block.timestamp);
    }

    /**
     * @notice Updates the confidence score for an existing verification (re-evaluation).
     * @dev Allows model re-runs to update stored confidence without full re-registration.
     * @param _fileHash  SHA-256 hash as bytes32
     * @param _newScore  New confidence score (0–100)
     */
    function updateConfidenceScore(bytes32 _fileHash, uint8 _newScore) external onlyController {
        require(_verifications[_fileHash].exists, "VerificationRegistry: no verification record found for this hash");

        uint8 oldScore = _verifications[_fileHash].confidenceScore;
        _verifications[_fileHash].confidenceScore = _newScore;

        emit ConfidenceUpdated(_fileHash, oldScore, _newScore, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // Read Functions (public view)
    // -----------------------------------------------------------------------

    /**
     * @notice Returns the VerificationRecord fields for a given file hash.
     * @param _fileHash SHA-256 hash to query
     * @return prediction      "REAL" or "FAKE"
     * @return confidenceScore 0–100 AI confidence
     * @return modelVersion    Model version string
     * @return verifiedAt      block.timestamp of verification
     * @return exists          True if a verification exists
     */
    function getVerification(bytes32 _fileHash) external view returns (
        string  memory prediction,
        uint8          confidenceScore,
        string  memory modelVersion,
        uint256        verifiedAt,
        bool           exists
    ) {
        VerificationRecord memory rec = _verifications[_fileHash];
        return (rec.prediction, rec.confidenceScore, rec.modelVersion, rec.verifiedAt, rec.exists);
    }

    /**
     * @notice Returns true if a verification record exists for the given hash.
     * @param _fileHash SHA-256 hash to check
     */
    function verificationExists(bytes32 _fileHash) external view returns (bool) {
        return _verifications[_fileHash].exists;
    }

    /**
     * @notice Contract version string.
     */
    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    // -----------------------------------------------------------------------
    // Admin
    // -----------------------------------------------------------------------

    /**
     * @notice Updates the controller address. Called once after RegistryController is deployed.
     * @param _newController RegistryController contract address
     */
    function setController(address _newController) external onlyOwner {
        require(_newController != address(0), "VerificationRegistry: invalid controller address");
        emit ControllerUpdated(controller, _newController);
        controller = _newController;
    }
}
