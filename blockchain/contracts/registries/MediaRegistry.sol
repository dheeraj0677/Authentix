// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MediaRegistry
 * @dev Stores file-level metadata for registered media files.
 *
 *      Architecture role: DATA MODULE (Media concern only)
 *
 *      Stores WHAT the file is — its type, name, size, and upload time.
 *      Logically independent of who owns it or what the AI decided.
 *
 *      When ownership transfers, media metadata stays unchanged.
 *      When AI model is retrained, media metadata stays unchanged.
 *
 *      Access control:
 *        - storeMedia():    onlyController (RegistryController)
 *        - getMedia():      public view (anyone)
 *        - mediaExists():   public view (anyone)
 *        - setController(): onlyOwner (one-time setup after deployment)
 */
contract MediaRegistry {

    // -----------------------------------------------------------------------
    // Data Structures
    // -----------------------------------------------------------------------

    struct MediaRecord {
        bytes32 fileHash;         // SHA-256 content hash (primary key)
        string  fileType;         // MIME type e.g. "image/jpeg", "video/mp4"
        string  filename;         // Sanitized original filename
        uint256 uploadTimestamp;  // block.timestamp at registration
        uint256 fileSizeBytes;    // File size in bytes (0 if unknown)
        bool    exists;           // Existence flag
    }

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    /// @notice Mapping from SHA-256 file hash to MediaRecord
    mapping(bytes32 => MediaRecord) private _media;

    /// @notice RegistryController address — only this can write
    address public controller;

    /// @notice Deployer — can call setController()
    address public owner;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event MediaStored(
        bytes32 indexed fileHash,
        string          fileType,
        string          filename,
        uint256         fileSizeBytes,
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
        require(msg.sender == controller, "MediaRegistry: caller is not controller");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "MediaRegistry: caller is not owner");
        _;
    }

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    /**
     * @param _controller Initial controller address.
     *        Pass deployer address initially; update to RegistryController
     *        after it is deployed via setController().
     */
    constructor(address _controller) {
        require(_controller != address(0), "MediaRegistry: invalid controller address");
        controller = _controller;
        owner      = msg.sender;
    }

    // -----------------------------------------------------------------------
    // Write Functions (onlyController)
    // -----------------------------------------------------------------------

    /**
     * @notice Stores media file metadata on-chain.
     * @param _fileHash      SHA-256 hash as bytes32
     * @param _fileType      MIME type string (e.g., "image/jpeg")
     * @param _filename      Sanitized filename
     * @param _fileSizeBytes File size in bytes (0 acceptable)
     */
    function storeMedia(
        bytes32        _fileHash,
        string calldata _fileType,
        string calldata _filename,
        uint256         _fileSizeBytes
    ) external onlyController {
        require(_fileHash != bytes32(0),     "MediaRegistry: invalid zero hash");
        require(!_media[_fileHash].exists,   "MediaRegistry: media already registered for this hash");

        _media[_fileHash] = MediaRecord({
            fileHash:        _fileHash,
            fileType:        _fileType,
            filename:        _filename,
            uploadTimestamp: block.timestamp,
            fileSizeBytes:   _fileSizeBytes,
            exists:          true
        });

        emit MediaStored(_fileHash, _fileType, _filename, _fileSizeBytes, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // Read Functions (public view)
    // -----------------------------------------------------------------------

    /**
     * @notice Returns the MediaRecord for a given file hash.
     * @param _fileHash SHA-256 hash to query
     * @return fileType       MIME type
     * @return filename       Sanitized filename
     * @return uploadTimestamp block.timestamp of registration
     * @return fileSizeBytes  File size in bytes
     * @return exists         True if registered
     */
    function getMedia(bytes32 _fileHash) external view returns (
        string  memory fileType,
        string  memory filename,
        uint256        uploadTimestamp,
        uint256        fileSizeBytes,
        bool           exists
    ) {
        MediaRecord memory rec = _media[_fileHash];
        return (rec.fileType, rec.filename, rec.uploadTimestamp, rec.fileSizeBytes, rec.exists);
    }

    /**
     * @notice Returns true if a media record exists for the given hash.
     * @param _fileHash SHA-256 hash to check
     */
    function mediaExists(bytes32 _fileHash) external view returns (bool) {
        return _media[_fileHash].exists;
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
        require(_newController != address(0), "MediaRegistry: invalid controller address");
        emit ControllerUpdated(controller, _newController);
        controller = _newController;
    }
}
