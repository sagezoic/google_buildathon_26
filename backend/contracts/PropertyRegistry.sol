// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Realdha PropertyRegistry
/// @notice Non-transferable property record tokens. tokenId == propertyId, so one parcel maps to exactly one token.
/// Only hashes live on-chain: documents, owner identity and lawyer sign-off stay off-chain (Cloud Storage / Postgres).
contract PropertyRegistry {
    enum Status { None, Active, Revoked }

    struct Record {
        bytes32 ownerRef;     // keccak256(salted owner identity); never a name or a wallet
        bytes32 docRoot;      // Merkle root over the sha256 hashes of the property documents
        bytes32 metadataHash; // keccak256 of the token metadata JSON stored in Cloud Storage
        bytes32 attestation;  // keccak256 of the lawyer sign-off record
        uint32 docCount;
        uint32 version;       // starts at 1, +1 on every update
        uint64 updatedAt;
        Status status;
        bool encumbered;      // lien or mortgage flag
    }

    address public admin;
    mapping(address => bool) public registrars;
    mapping(uint256 => Record) private records;
    string public baseURI;

    /// ERC-721 compatible so explorers list the token. Tokens are soulbound: minted once, never transferred.
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event PropertyRegistered(uint256 indexed propertyId, bytes32 ownerRef, bytes32 docRoot, bytes32 attestation, uint32 docCount);
    event PropertyUpdated(uint256 indexed propertyId, uint32 version, bytes32 docRoot, bytes32 attestation, uint32 docCount);
    event OwnerChanged(uint256 indexed propertyId, bytes32 oldOwnerRef, bytes32 newOwnerRef, uint32 version);
    event EncumbranceSet(uint256 indexed propertyId, bool encumbered);
    event PropertyRevoked(uint256 indexed propertyId, bytes32 reason);
    event RegistrarSet(address indexed registrar, bool allowed);

    error NotAuthorised();
    error AlreadyRegistered();
    error NotActive();
    error ZeroValue();

    modifier onlyAdmin() { if (msg.sender != admin) revert NotAuthorised(); _; }
    modifier onlyRegistrar() { if (!registrars[msg.sender]) revert NotAuthorised(); _; }

    constructor(string memory baseURI_) {
        admin = msg.sender;
        registrars[msg.sender] = true;
        baseURI = baseURI_;
        emit RegistrarSet(msg.sender, true);
    }

    function setRegistrar(address who, bool allowed) external onlyAdmin {
        registrars[who] = allowed;
        emit RegistrarSet(who, allowed);
    }

    function setBaseURI(string calldata uri) external onlyAdmin { baseURI = uri; }

    /// Deterministic property id from normalised land identifiers, e.g. ("IN-MH-PUNE-MAVAL-KUSGAON", "112/2").
    function propertyIdOf(string memory jurisdiction, string memory parcel) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(jurisdiction, parcel)));
    }

    function register(
        uint256 propertyId, bytes32 ownerRef, bytes32 docRoot, bytes32 metadataHash, bytes32 attestation, uint32 docCount
    ) external onlyRegistrar {
        if (records[propertyId].status != Status.None) revert AlreadyRegistered();
        if (ownerRef == 0 || docRoot == 0 || attestation == 0) revert ZeroValue();
        records[propertyId] = Record(ownerRef, docRoot, metadataHash, attestation, docCount, 1, uint64(block.timestamp), Status.Active, false);
        emit Transfer(address(0), address(this), propertyId);
        emit PropertyRegistered(propertyId, ownerRef, docRoot, attestation, docCount);
    }

    /// New documents or a new lawyer sign-off: bumps the version. Old versions stay readable from event logs.
    function update(uint256 propertyId, bytes32 docRoot, bytes32 metadataHash, bytes32 attestation, uint32 docCount) external onlyRegistrar {
        Record storage r = records[propertyId];
        if (r.status != Status.Active) revert NotActive();
        if (docRoot == 0 || attestation == 0) revert ZeroValue();
        r.docRoot = docRoot;
        r.metadataHash = metadataHash;
        r.attestation = attestation;
        r.docCount = docCount;
        r.version += 1;
        r.updatedAt = uint64(block.timestamp);
        emit PropertyUpdated(propertyId, r.version, docRoot, attestation, docCount);
    }

    /// Legal change of owner (sale, inheritance, court order). Registrar-only, never self-service.
    function changeOwner(uint256 propertyId, bytes32 newOwnerRef, bytes32 docRoot, bytes32 metadataHash, bytes32 attestation, uint32 docCount) external onlyRegistrar {
        Record storage r = records[propertyId];
        if (r.status != Status.Active) revert NotActive();
        if (newOwnerRef == 0 || docRoot == 0 || attestation == 0) revert ZeroValue();
        bytes32 old = r.ownerRef;
        r.ownerRef = newOwnerRef;
        r.docRoot = docRoot;
        r.metadataHash = metadataHash;
        r.attestation = attestation;
        r.docCount = docCount;
        r.version += 1;
        r.updatedAt = uint64(block.timestamp);
        emit OwnerChanged(propertyId, old, newOwnerRef, r.version);
    }

    function setEncumbered(uint256 propertyId, bool encumbered) external onlyRegistrar {
        Record storage r = records[propertyId];
        if (r.status != Status.Active) revert NotActive();
        r.encumbered = encumbered;
        r.updatedAt = uint64(block.timestamp);
        emit EncumbranceSet(propertyId, encumbered);
    }

    function revoke(uint256 propertyId, bytes32 reason) external onlyRegistrar {
        Record storage r = records[propertyId];
        if (r.status != Status.Active) revert NotActive();
        r.status = Status.Revoked;
        r.updatedAt = uint64(block.timestamp);
        emit PropertyRevoked(propertyId, reason);
    }

    function getRecord(uint256 propertyId) external view returns (Record memory) { return records[propertyId]; }

    /// Is `leaf` (sha256 of a document) part of the anchored set? Pairs are hashed in sorted order.
    function verifyDocument(uint256 propertyId, bytes32 leaf, bytes32[] calldata proof) external view returns (bool) {
        Record storage r = records[propertyId];
        if (r.status != Status.Active) return false;
        bytes32 h = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            h = h < proof[i] ? keccak256(abi.encodePacked(h, proof[i])) : keccak256(abi.encodePacked(proof[i], h));
        }
        return h == r.docRoot;
    }

    function tokenURI(uint256 propertyId) external view returns (string memory) {
        require(records[propertyId].status != Status.None, "unknown token");
        return string.concat(baseURI, _toString(propertyId), ".json");
    }

    function _toString(uint256 v) private pure returns (string memory) {
        if (v == 0) return "0";
        uint256 n = v; uint256 len;
        while (n != 0) { len++; n /= 10; }
        bytes memory b = new bytes(len);
        while (v != 0) { len--; b[len] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(b);
    }
}
