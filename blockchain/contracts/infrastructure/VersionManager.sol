// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VersionManager
 * @dev On-chain address book and version history for all Authentix registry modules.
 *
 *      Architecture role: INFRASTRUCTURE
 *
 *      RegistryController never hardcodes module addresses.
 *      Instead, it asks VersionManager at call time: "what is the current
 *      MediaRegistry address?" This allows zero-downtime module upgrades:
 *
 *        1. Deploy new MediaRegistry_v2
 *        2. Call upgradeModule("MediaRegistry", newAddr)
 *        3. VersionManager archives old address, increments version counter
 *        4. All future RegistryController calls resolve to new address
 *        5. No RegistryController redeployment needed
 *        6. No client address changes needed
 *
 *      Module names (case-sensitive keys):
 *        "MediaRegistry"        → MediaRegistry.sol
 *        "OwnershipRegistry"    → OwnershipRegistry.sol
 *        "VerificationRegistry" → VerificationRegistry.sol
 *        "VerificationLog"      → VerificationLog.sol
 */
contract VersionManager {

    // -----------------------------------------------------------------------
    // Data Structures
    // -----------------------------------------------------------------------

    struct ModuleInfo {
        address currentAddress;   // Live contract address
        uint256 version;          // Monotonically incrementing version counter
        uint256 deployedAt;       // block.timestamp of current version deployment
        string  name;             // Module name key
        bool    exists;           // Registration existence flag
    }

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    /// @notice Module name → current ModuleInfo
    mapping(string => ModuleInfo) public modules;

    /// @notice Module name → history of all past addresses (oldest first)
    mapping(string => address[]) public moduleHistory;

    /// @notice Deployer / admin address
    address public owner;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event ModuleRegistered(
        string  indexed moduleName,
        address         moduleAddress,
        uint256         version,
        uint256         timestamp
    );

    event ModuleUpgraded(
        string  indexed moduleName,
        address         oldAddress,
        address         newAddress,
        uint256         newVersion,
        uint256         timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // -----------------------------------------------------------------------
    // Modifiers
    // -----------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "VersionManager: caller is not owner");
        _;
    }

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    constructor() {
        owner = msg.sender;
    }

    // -----------------------------------------------------------------------
    // Module Registration & Upgrade
    // -----------------------------------------------------------------------

    /**
     * @notice Registers a new module by name and address.
     * @param _name          Unique string key (e.g., "MediaRegistry")
     * @param _moduleAddress Deployed contract address of the module
     */
    function registerModule(string calldata _name, address _moduleAddress) external onlyOwner {
        require(_moduleAddress != address(0), "VersionManager: invalid module address");
        require(bytes(_name).length > 0, "VersionManager: module name cannot be empty");
        require(!modules[_name].exists, "VersionManager: module already registered - use upgradeModule()");

        modules[_name] = ModuleInfo({
            currentAddress: _moduleAddress,
            version:        1,
            deployedAt:     block.timestamp,
            name:           _name,
            exists:         true
        });

        emit ModuleRegistered(_name, _moduleAddress, 1, block.timestamp);
    }

    /**
     * @notice Atomically upgrades a module to a new contract address.
     *         Archives the old address in moduleHistory.
     * @param _name       Module name key (must already be registered)
     * @param _newAddress New deployed contract address
     */
    function upgradeModule(string calldata _name, address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "VersionManager: invalid module address");
        require(modules[_name].exists, "VersionManager: module not registered - use registerModule()");
        require(
            modules[_name].currentAddress != _newAddress,
            "VersionManager: new address must differ from current"
        );

        address oldAddress = modules[_name].currentAddress;

        // Archive old address
        moduleHistory[_name].push(oldAddress);

        // Update to new version
        modules[_name].currentAddress = _newAddress;
        modules[_name].version       += 1;
        modules[_name].deployedAt     = block.timestamp;

        emit ModuleUpgraded(_name, oldAddress, _newAddress, modules[_name].version, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // Read Functions
    // -----------------------------------------------------------------------

    /**
     * @notice Returns the current live address for a named module.
     * @param _name Module name key
     */
    function getModuleAddress(string calldata _name) external view returns (address) {
        require(modules[_name].exists, "VersionManager: module not found");
        return modules[_name].currentAddress;
    }

    /**
     * @notice Returns the current version number of a module.
     * @param _name Module name key
     */
    function getModuleVersion(string calldata _name) external view returns (uint256) {
        require(modules[_name].exists, "VersionManager: module not found");
        return modules[_name].version;
    }

    /**
     * @notice Returns all past addresses (archive) for a module.
     * @param _name Module name key
     */
    function getModuleHistory(string calldata _name) external view returns (address[] memory) {
        return moduleHistory[_name];
    }

    /**
     * @notice Returns full ModuleInfo struct for a named module.
     * @param _name Module name key
     */
    function getModuleInfo(string calldata _name) external view returns (
        address currentAddress,
        uint256 version,
        uint256 deployedAt,
        bool    exists
    ) {
        ModuleInfo memory m = modules[_name];
        return (m.currentAddress, m.version, m.deployedAt, m.exists);
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
     * @notice Transfers VersionManager ownership to a new address.
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "VersionManager: invalid new owner");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}
