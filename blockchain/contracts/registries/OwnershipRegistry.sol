// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OwnershipRegistry
 * @dev Tracks ownership of registered media files and provides a wallet-indexed
 *      reverse lookup (wallet → list of file hashes it has registered).
 *
 *      Architecture role: DATA MODULE (Ownership concern)
 *
 *      New capabilities over AuthenticityRegistry.sol:
 *        1. Ownership Transfer: currentOwner can transfer to a new wallet
 *        2. Wallet Index: O(1) enumeration of all files a wallet owns
 *        3. originalRegistrar: immutable record of first registrar
 *        4. Transfer history via lastTransferTimestamp
 *
 *      The wallet index (walletFiles mapping) enables the backend's
 *      GET /history/{wallet} to eventually be answered fully on-chain.
 *
 *      Access control:
 *        - recordOwnership():  onlyController
 *        - transferOwnership(): onlyController (caller must verify msg.sender == currentOwner)
 *        - getOwner():         public view
 *        - getFilesByWallet(): public view
 */
contract OwnershipRegistry {

    // -----------------------------------------------------------------------
    // Data Structures
    // -----------------------------------------------------------------------

    struct OwnershipRecord {
        address currentOwner;            // Current owner wallet
        address originalRegistrar;       // First wallet to register (immutable)
        uint256 registrationTimestamp;   // block.timestamp of first registration
        uint256 lastTransferTimestamp;   // block.timestamp of last transfer (0 = never)
        bool    isActive;                // false = deactivated (future revocation)
    }

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    /// @notice Mapping from SHA-256 file hash to OwnershipRecord
    mapping(bytes32 => OwnershipRecord) private _ownership;

    /// @notice Wallet address → list of file hashes it has registered or received
    mapping(address => bytes32[]) private _walletFiles;

    /// @notice RegistryController address — only this can write
    address public controller;

    /// @notice Deployer — can call setController()
    address public owner;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event OwnershipRecorded(
        bytes32 indexed fileHash,
        address indexed fileOwner,
        uint256         timestamp
    );

    event OwnershipTransferred(
        bytes32 indexed fileHash,
        address indexed fromOwner,
        address indexed toOwner,
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
        require(msg.sender == controller, "OwnershipRegistry: caller is not controller");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "OwnershipRegistry: caller is not owner");
        _;
    }

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    constructor(address _controller) {
        require(_controller != address(0), "OwnershipRegistry: invalid controller address");
        controller = _controller;
        owner      = msg.sender;
    }

    // -----------------------------------------------------------------------
    // Write Functions (onlyController)
    // -----------------------------------------------------------------------

    /**
     * @notice Records ownership of a newly registered file hash.
     * @param _fileHash SHA-256 hash as bytes32
     * @param _owner    Wallet address of the registrar
     */
    function recordOwnership(bytes32 _fileHash, address _owner) external onlyController {
        require(_fileHash != bytes32(0),         "OwnershipRegistry: invalid zero hash");
        require(_owner != address(0),            "OwnershipRegistry: invalid owner address");
        require(!_ownership[_fileHash].isActive, "OwnershipRegistry: ownership already recorded for this hash");

        _ownership[_fileHash] = OwnershipRecord({
            currentOwner:          _owner,
            originalRegistrar:     _owner,
            registrationTimestamp: block.timestamp,
            lastTransferTimestamp: 0,
            isActive:              true
        });

        _walletFiles[_owner].push(_fileHash);

        emit OwnershipRecorded(_fileHash, _owner, block.timestamp);
    }

    /**
     * @notice Transfers ownership of a registered file to a new owner.
     * @dev RegistryController is responsible for verifying that msg.sender == currentOwner
     *      before calling this function.
     * @param _fileHash  SHA-256 hash as bytes32
     * @param _newOwner  New owner wallet address
     */
    function transferOwnership(bytes32 _fileHash, address _newOwner) external onlyController {
        require(_ownership[_fileHash].isActive, "OwnershipRegistry: no active ownership record for this hash");
        require(_newOwner != address(0),         "OwnershipRegistry: invalid new owner address");
        require(
            _newOwner != _ownership[_fileHash].currentOwner,
            "OwnershipRegistry: new owner must differ from current owner"
        );

        address oldOwner = _ownership[_fileHash].currentOwner;

        _ownership[_fileHash].currentOwner          = _newOwner;
        _ownership[_fileHash].lastTransferTimestamp  = block.timestamp;

        // Add to new owner's wallet index
        _walletFiles[_newOwner].push(_fileHash);

        emit OwnershipTransferred(_fileHash, oldOwner, _newOwner, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // Read Functions (public view)
    // -----------------------------------------------------------------------

    /**
     * @notice Returns the OwnershipRecord fields for a given file hash.
     * @param _fileHash SHA-256 hash to query
     * @return currentOwner          Current owner wallet
     * @return originalRegistrar     First wallet to register this hash
     * @return registrationTimestamp block.timestamp of first registration
     * @return lastTransferTimestamp block.timestamp of last ownership transfer (0 = never)
     * @return isActive              True if ownership record is active
     */
    function getOwner(bytes32 _fileHash) external view returns (
        address currentOwner,
        address originalRegistrar,
        uint256 registrationTimestamp,
        uint256 lastTransferTimestamp,
        bool    isActive
    ) {
        OwnershipRecord memory rec = _ownership[_fileHash];
        return (
            rec.currentOwner,
            rec.originalRegistrar,
            rec.registrationTimestamp,
            rec.lastTransferTimestamp,
            rec.isActive
        );
    }

    /**
     * @notice Returns all file hashes registered by or transferred to a wallet.
     * @dev Enables on-chain wallet history lookup. Replaces backend DB query for history.
     * @param _wallet Wallet address to query
     * @return Array of bytes32 file hashes
     */
    function getFilesByWallet(address _wallet) external view returns (bytes32[] memory) {
        return _walletFiles[_wallet];
    }

    /**
     * @notice Returns the current owner address for a given file hash.
     * @param _fileHash SHA-256 hash to query
     */
    function getCurrentOwner(bytes32 _fileHash) external view returns (address) {
        return _ownership[_fileHash].currentOwner;
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
        require(_newController != address(0), "OwnershipRegistry: invalid controller address");
        emit ControllerUpdated(controller, _newController);
        controller = _newController;
    }
}
