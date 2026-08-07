// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VerificationLog
 * @dev Append-only, tamper-proof audit trail of every registration and
 *      verification query in the Authentix system.
 *
 *      Architecture role: AUDIT MODULE
 *
 *      Key properties:
 *        - APPEND-ONLY: events are never deleted or modified
 *        - IMMUTABLE: once logged, event data cannot change
 *        - INDEXED: O(1) lookup by file hash OR by actor wallet
 *        - MONOTONIC: eventId is strictly monotonically increasing
 *
 *      Every registration is logged. Every verification query that finds
 *      a record is also logged via logQuery() (called from RegistryController
 *      in verifyAndLog()). This creates a full forensic audit trail.
 *
 *      Event types:
 *        REGISTRATION        — new file hash registered
 *        VERIFICATION_QUERY  — existing hash queried by a wallet
 *        OWNERSHIP_TRANSFER  — file ownership transferred
 *        MODULE_UPGRADE      — a module was upgraded in VersionManager
 *
 *      Access control:
 *        - logRegistration():     onlyController
 *        - logQuery():            onlyController
 *        - logOwnershipTransfer(): onlyController
 *        - logModuleUpgrade():    onlyController
 *        - All getters:           public view
 */
contract VerificationLog {

    // -----------------------------------------------------------------------
    // Data Structures
    // -----------------------------------------------------------------------

    /// @notice Event type classification
    enum EventType {
        REGISTRATION,          // 0
        VERIFICATION_QUERY,    // 1
        OWNERSHIP_TRANSFER,    // 2
        MODULE_UPGRADE         // 3
    }

    struct VerificationEvent {
        uint256   eventId;    // Monotonically incrementing ID (0-indexed)
        bytes32   fileHash;   // Which file this event is about (bytes32(0) for MODULE_UPGRADE)
        address   actor;      // Wallet that triggered the event
        EventType eventType;  // Classification enum
        uint256   timestamp;  // block.timestamp
        string    metadata;   // Optional context (prediction, transfer target, module name)
    }

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    /// @notice Append-only array of all events — never modified after append
    VerificationEvent[] private _eventLog;

    /// @notice fileHash → list of eventIds involving that hash
    mapping(bytes32 => uint256[]) private _fileEventIndex;

    /// @notice actor address → list of eventIds triggered by that actor
    mapping(address => uint256[]) private _actorEventIndex;

    /// @notice RegistryController address — only this can write
    address public controller;

    /// @notice Deployer — can call setController()
    address public owner;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event AuditEventLogged(
        uint256   indexed eventId,
        bytes32   indexed fileHash,
        address   indexed actor,
        EventType         eventType,
        uint256           timestamp
    );

    event ControllerUpdated(
        address indexed oldController,
        address indexed newController
    );

    // -----------------------------------------------------------------------
    // Modifiers
    // -----------------------------------------------------------------------

    modifier onlyController() {
        require(msg.sender == controller, "VerificationLog: caller is not controller");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "VerificationLog: caller is not owner");
        _;
    }

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    constructor(address _controller) {
        require(_controller != address(0), "VerificationLog: invalid controller address");
        controller = _controller;
        owner      = msg.sender;
    }

    // -----------------------------------------------------------------------
    // Internal — Core Append Logic
    // -----------------------------------------------------------------------

    /**
     * @dev Appends a new event to the log. Internal — called by all public log functions.
     * @return eventId The ID of the newly logged event.
     */
    function _logEvent(
        bytes32   _fileHash,
        address   _actor,
        EventType _eventType,
        string memory _metadata
    ) internal returns (uint256 eventId) {
        eventId = _eventLog.length;

        _eventLog.push(VerificationEvent({
            eventId:   eventId,
            fileHash:  _fileHash,
            actor:     _actor,
            eventType: _eventType,
            timestamp: block.timestamp,
            metadata:  _metadata
        }));

        _fileEventIndex[_fileHash].push(eventId);
        _actorEventIndex[_actor].push(eventId);

        emit AuditEventLogged(eventId, _fileHash, _actor, _eventType, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // Write Functions (onlyController)
    // -----------------------------------------------------------------------

    /**
     * @notice Logs a file registration event.
     * @param _fileHash   SHA-256 hash registered
     * @param _actor      Registrar wallet address
     * @param _prediction "REAL" or "FAKE"
     * @return eventId    ID of the logged event
     */
    function logRegistration(
        bytes32         _fileHash,
        address         _actor,
        string calldata _prediction
    ) external onlyController returns (uint256) {
        return _logEvent(_fileHash, _actor, EventType.REGISTRATION, _prediction);
    }

    /**
     * @notice Logs a verification query event (when a wallet queries a known hash).
     * @param _fileHash SHA-256 hash that was queried
     * @param _actor    Querier wallet address
     * @return eventId  ID of the logged event
     */
    function logQuery(
        bytes32 _fileHash,
        address _actor
    ) external onlyController returns (uint256) {
        return _logEvent(_fileHash, _actor, EventType.VERIFICATION_QUERY, "");
    }

    /**
     * @notice Logs an ownership transfer event.
     * @param _fileHash SHA-256 hash whose ownership changed
     * @param _actor    Previous owner (initiator of the transfer)
     * @param _metadata Context string e.g. "to:0x1234..."
     * @return eventId  ID of the logged event
     */
    function logOwnershipTransfer(
        bytes32         _fileHash,
        address         _actor,
        string calldata _metadata
    ) external onlyController returns (uint256) {
        return _logEvent(_fileHash, _actor, EventType.OWNERSHIP_TRANSFER, _metadata);
    }

    /**
     * @notice Logs a module upgrade event in VersionManager.
     * @param _actor    Address that initiated the upgrade (owner)
     * @param _metadata Context string e.g. "MediaRegistry v1→v2"
     * @return eventId  ID of the logged event
     */
    function logModuleUpgrade(
        address         _actor,
        string calldata _metadata
    ) external onlyController returns (uint256) {
        // fileHash is bytes32(0) for system-level events (no specific file)
        return _logEvent(bytes32(0), _actor, EventType.MODULE_UPGRADE, _metadata);
    }

    // -----------------------------------------------------------------------
    // Read Functions (public view)
    // -----------------------------------------------------------------------

    /**
     * @notice Returns a single event by its ID.
     * @param _eventId Event ID to retrieve
     */
    function getEvent(uint256 _eventId) external view returns (
        uint256   eventId,
        bytes32   fileHash,
        address   actor,
        EventType eventType,
        uint256   timestamp,
        string memory metadata
    ) {
        require(_eventId < _eventLog.length, "VerificationLog: event ID does not exist");
        VerificationEvent memory e = _eventLog[_eventId];
        return (e.eventId, e.fileHash, e.actor, e.eventType, e.timestamp, e.metadata);
    }

    /**
     * @notice Returns all event IDs associated with a file hash.
     * @param _fileHash SHA-256 hash to query
     */
    function getEventIdsByHash(bytes32 _fileHash) external view returns (uint256[] memory) {
        return _fileEventIndex[_fileHash];
    }

    /**
     * @notice Returns all event IDs associated with an actor wallet.
     * @param _actor Wallet address to query
     */
    function getEventIdsByActor(address _actor) external view returns (uint256[] memory) {
        return _actorEventIndex[_actor];
    }

    /**
     * @notice Returns full event data for all events associated with a file hash.
     * @param _fileHash SHA-256 hash to query
     * @dev Note: may be expensive for files with many events. Use getEventIdsByHash + getEvent for pagination.
     */
    function getEventsByHash(bytes32 _fileHash) external view returns (
        uint256[] memory eventIds,
        address[] memory actors,
        EventType[] memory eventTypes,
        uint256[] memory timestamps,
        string[] memory metadatas
    ) {
        uint256[] memory ids = _fileEventIndex[_fileHash];
        uint256 len = ids.length;

        eventIds   = new uint256[](len);
        actors     = new address[](len);
        eventTypes = new EventType[](len);
        timestamps = new uint256[](len);
        metadatas  = new string[](len);

        for (uint256 i = 0; i < len; i++) {
            VerificationEvent memory e = _eventLog[ids[i]];
            eventIds[i]   = e.eventId;
            actors[i]     = e.actor;
            eventTypes[i] = e.eventType;
            timestamps[i] = e.timestamp;
            metadatas[i]  = e.metadata;
        }
    }

    /**
     * @notice Returns the total number of events ever logged.
     */
    function getTotalEventCount() external view returns (uint256) {
        return _eventLog.length;
    }

    /**
     * @notice Returns the number of events logged for a specific file hash.
     * @param _fileHash SHA-256 hash to query
     */
    function getEventCountByHash(bytes32 _fileHash) external view returns (uint256) {
        return _fileEventIndex[_fileHash].length;
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
        require(_newController != address(0), "VerificationLog: invalid controller address");
        emit ControllerUpdated(controller, _newController);
        controller = _newController;
    }
}
