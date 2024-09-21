// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import "./interfaces/IWorldVerifier.sol";

import {DataLocation} from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import "./error.sol";
import "hardhat/console.sol";
contract Sniper is Ownable(msg.sender) {
    IWorldVerifier public worldVerifier;
    ISP public signProtocol;
    IERC20 public rewardToken;
    uint64 public immutable schemaId;

    struct SniperZone {
        string ipfsHash;
        uint256 startTime;
        uint256 duration;
        bool completed;
        uint64 attestationId;
    }

    mapping(address => SniperZone[]) public userZones;

    event ZoneCreated(
        address indexed user,
        uint256 zoneId,
        SniperZone zone
    );
    event ZoneCompleted(
        address indexed user,
        uint256 zoneId,
        uint256 distractionIndex,
        uint64 attestationId
    );

    constructor(
        address _worldVerifier,
        address _signProtocol,
        address _rewardToken,
        uint64 _schemaId
    ) {
        worldVerifier = IWorldVerifier(_worldVerifier);
        signProtocol = ISP(_signProtocol);
        rewardToken = IERC20(_rewardToken);
        schemaId = _schemaId;
    }

    modifier onlyVerifiedUser() {
        require(
            worldVerifier.isHuman(msg.sender),
            "User not verified by WorldID"
        );
        _;
    }

    function createSniperZone(
        string memory ipfsHash,
        uint256 duration
    ) external onlyVerifiedUser {
        SniperZone memory newZone = SniperZone({
            ipfsHash: ipfsHash,
            startTime: block.timestamp,
            duration: duration,
            completed: false,
            attestationId: 0
        });

        userZones[msg.sender].push(newZone);
        uint256 zoneId = userZones[msg.sender].length - 1;

        emit ZoneCreated(msg.sender, zoneId, newZone);
    }

    function completeZone(
        address user,
        uint256 zoneId,
        uint256 distractionIndex
    ) external onlyOwner {

        SniperZone storage zone = userZones[user][zoneId];
        require(
            block.timestamp >= zone.startTime + zone.duration,
            "Zone not yet ended"
        );
        require(!zone.completed, "Zone already completed");

        Attestation memory attestation = Attestation({
            schemaId: schemaId,
            linkedAttestationId: 0,
            attestTimestamp: uint64(block.timestamp),
            revokeTimestamp: 0,
            attester: address(this),
            validUntil: 0,
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: new bytes[](1),
            data: abi.encodePacked(msg.sender)
        });
        attestation.recipients[0] = (abi.encodePacked(user));
        zone.attestationId = signProtocol.attest(
            attestation,
            rewardToken,
            calculateReward(distractionIndex),
            "",
            "",
            abi.encode(user)
        );
        zone.completed = true;
        emit ZoneCompleted(
            user,
            zoneId,
            distractionIndex,
            zone.attestationId
        );
    }

    function calculateReward(
        uint256 distractionIndex
    ) internal pure returns (uint256) {
        // Custom reward logic: for example, the lower the distraction index, the higher the reward
        return (1000 - distractionIndex * 10) * 1 ether; // Example: max 1000 tokens, reducing with higher distraction
    }
}
