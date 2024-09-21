// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;
import {Attestation} from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import {DataLocation} from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import {IWorldID} from "./interfaces/IWorldID.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import "./error.sol";

library ByteHasher {
    /// @dev Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}

contract WorldVerifier {
    using ByteHasher for bytes;
    ISP public signProtocol;

    IWorldID internal immutable worldId;
    uint256 internal immutable verifyNullifierHash;
    uint256 internal immutable groupId = 1;
    mapping(uint256 => bool) internal nullifierHashes;
    mapping(address => bool) public isHuman;
    // the schemaId to check against
    uint64 public immutable schemaId;

    // the trusted attester
    address public immutable attester;

    /// @notice the reference to the MACI contract
    address public maci;

    // a mapping of attestations that have already registered
    mapping(uint64 => bool) public registeredAttestations;

    event Verify(address indexed user);

    /// @notice Deploy an instance of SPGatekeeper
    /// @param _sp The SP contract
    /// @param _schemaId The schemaId UID
    constructor(
        address _sp,
        address _worldId,
        uint64 _schemaId,
        string memory _appId
    ) {
        if (_sp == address(0)) revert ZeroAddress();
        signProtocol = ISP(_sp);

        schemaId = _schemaId;
        worldId = IWorldID(_worldId);
        verifyNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), "verify")
            .hashToField();
    }

    function verifyWorldAction(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        verifyAndExecute(
            msg.sender,
            root,
            nullifierHash,
            proof,
            verifyNullifierHash
        );
        emit Verify(msg.sender);
    
        Attestation memory attestation = Attestation({
            schemaId: schemaId,
            linkedAttestationId: 0,
            attestTimestamp: uint64(block.timestamp),
            revokeTimestamp: 0,
            attester: address(this),
            validUntil: 0,
            dataLocation: DataLocation.ONCHAIN,
            revoked: true,
            recipients: new bytes[](1),
            data: abi.encode(root, nullifierHash, proof)
        });
        attestation.recipients[0] = (abi.encode(msg.sender));
        // Emit SP attest here
        signProtocol.attest(attestation, "", "", "");
        isHuman[msg.sender] = true;
    }

    function verifyAndExecute(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        uint256 externalNullifierHash
    ) internal {
        // First, we make sure this person hasn't done this before
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();

        // We now verify the provided proof is valid and the user is verified by World ID
        worldId.verifyProof(
            root,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // We now record the user has done this, so they can't do it again (sybil-resistance)
        nullifierHashes[nullifierHash] = true;
    }
}
