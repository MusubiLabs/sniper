// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "./error.sol";
import {SignUpGatekeeper} from "maci-contracts/contracts/gatekeepers/SignUpGatekeeper.sol";
import {ISP} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import {Attestation} from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
/// @title SniperSPGatekeeper
/// @notice A gatekeeper contract which allows users to sign up to MACI
/// only if they've received an attestation of a specific schemaId from a trusted attester
contract SniperSPGatekeeper is SignUpGatekeeper, Ownable(msg.sender) {
    // the reference to the SP contract
    ISP public immutable sp;

    // the schemaId to check against
    uint64 public immutable schemaId;

    // the trusted attester
    address public immutable attester;
    address public partyManager;
    /// @notice the reference to the MACI contract
    mapping(address => bool) public maci;

    // a mapping of attestations that have already registered
    mapping(uint64 => mapping(uint256 => bool)) public registeredAttestations;

    modifier onlyPartyManager() {
        if (msg.sender != partyManager) {
            revert InvalidPartyManager();
        }
        _;
    }

    function setPartyManager(address _partyManager) external onlyOwner {
        partyManager = _partyManager;
    }

    /// @notice Deploy an instance of SniperSPGatekeeper
    /// @param _sp The SP contract
    /// @param _attester The trusted attester
    /// @param _schemaId The schemaId UID
    constructor(address _sp, address _attester, uint64 _schemaId) payable {
        if (_sp == address(0) || _attester == address(0)) revert ZeroAddress();
        sp = ISP(_sp);
        schemaId = _schemaId;
        attester = _attester;
    }

    /// @notice Adds an uninitialised MACI instance to allow for token signups
    /// @param _maci The MACI contract interface to be stored
    function setMaciInstance(address _maci) public override onlyPartyManager {
        if (_maci == address(0)) revert ZeroAddress();
        maci[_maci] = true;
    }

    /// @notice Register an user based on their attestation
    /// @dev Throw if the attestation is not valid or just complete silently
    /// @param _user The user's Ethereum address.
    /// @param _data The ABI-encoded schemaIdId as a uint256.
    function register(address _user, bytes memory _data) public override {
        // decode the argument
        (uint64 attestationId, uint256 partyId) = abi.decode(
            _data,
            (uint64, uint256)
        );
        // ensure that the caller is the MACI contract
        if (!maci[msg.sender]) revert OnlyMACI();

        // ensure that the attestation has not been registered yet
        if (registeredAttestations[attestationId][partyId])
            revert AlreadyRegistered();

        // register the attestation so it cannot be called again with the same one
        registeredAttestations[attestationId][partyId] = true;

        // get the attestation from the SP contract
        Attestation memory attestation = sp.getAttestation(attestationId);

        // the schemaId must match
        if (attestation.schemaId != schemaId) revert InvalidSchema();

        // we check that the attestation attester is the trusted one
        if (attestation.attester != attester) revert AttesterNotTrusted();

        // we check that it was not revoked
        if (attestation.revokeTimestamp != 0) revert AttestationRevoked();

        address user = abi.decode(attestation.recipients[0], (address));
        // one cannot register an attestation for another user
        if (user != _user) revert NotYourAttestation();
    }

    /// @notice Get the trait of the gatekeeper
    /// @return The type of the gatekeeper
    function getTrait() public pure override returns (string memory) {
        return "SignProtocol";
    }
}
