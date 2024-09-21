// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISP, Attestation} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import {IWorldVerifier} from "./interfaces/IWorldVerifier.sol";
import {DataLocation} from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";

import "./error.sol";

contract Sniper is Ownable(msg.sender) {
    // 最大分數為 1000，為避免處理小數點，將基礎值放大 1000 倍來計算
    uint256 constant BASE_REWARD = 1000 * 1000;
    uint256 constant DISTRACTION_PENALTY = 5 * 1000; // 每次分心扣除的分數放大 1000 倍

    IWorldVerifier public worldVerifier;
    ISP public signProtocol;
    IERC20 public rewardToken;
    address public partyManager;
    uint64 public immutable schemaId;
    enum ZoneMode {
        Solo,
        Party
    }

    struct SniperZone {
        string ipfsHash;
        uint256 startTime;
        uint256 duration;
        bool completed;
        uint64 attestationId;
        ZoneMode mode;
    }

    struct CompletedDetails {
        uint256 distractionScore;
        uint256 productivityScore;
        uint256 finalDuration;
        string ipfsHash;
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
        uint256 distractionScore,
        uint256 productivityScore,
        uint256 finalDuration,
        uint64 attestationId
    );

    constructor(
        address _worldVerifier,
        address _signProtocol,
        address _rewardToken,
        address _partyManager,
        uint64 _schemaId
    ) {
        worldVerifier = IWorldVerifier(_worldVerifier);
        signProtocol = ISP(_signProtocol);
        rewardToken = IERC20(_rewardToken);
        schemaId = _schemaId;
        partyManager = _partyManager;
    }

    modifier onlyVerifiedUser() {
        if (!worldVerifier.isHuman(msg.sender)) {
            revert UnverifiedUser();
        }
        _;
    }

    modifier onlyPartyManager() {
        if (msg.sender != partyManager) {
            revert UnverifiedUser();
        }
        _;
    }

    function createSniperZone(
        uint256 duration,
        uint256 startTime,
        string memory ipfsHash
    ) external onlyVerifiedUser returns (uint256 zoneId) {
        SniperZone memory newZone = SniperZone({
            ipfsHash: ipfsHash,
            startTime: startTime,
            duration: duration,
            completed: false,
            attestationId: 0,
            mode: ZoneMode.Solo
        });

        userZones[msg.sender].push(newZone);
        zoneId = userZones[msg.sender].length - 1;

        emit ZoneCreated(msg.sender, zoneId, newZone);
    }

    function createPartySniperZone(
        uint256 duration,
        uint256 startTime,
        string memory ipfsHash,
        address user
    ) external onlyPartyManager returns (uint256 zoneId) {
        SniperZone memory newZone = SniperZone({
            ipfsHash: ipfsHash,
            startTime: startTime,
            duration: duration,
            completed: false,
            attestationId: 0,
            mode: ZoneMode.Party
        });

        userZones[user].push(newZone);
        zoneId = userZones[user].length - 1;

        emit ZoneCreated(user, zoneId, newZone);
    }

    function completeZone(
        address user,
        uint256 zoneId,
        CompletedDetails calldata details
    ) external onlyOwner {
        SniperZone storage zone = userZones[user][zoneId];
        if (zone.completed) {
            revert ZoneAlreadyFinalized();
        }

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
            data: abi.encode(
                zoneId,
                details.productivityScore,
                details.distractionScore,
                details.finalDuration,
                details.ipfsHash
            )
        });
        attestation.recipients[0] = (abi.encodePacked(user));
        zone.attestationId = signProtocol.attest(
            attestation,
            rewardToken,
            calculateReward(
                details.distractionScore,
                details.productivityScore,
                details.finalDuration,
                zone.duration
            ),
            "",
            "",
            abi.encode(user)
        );
        zone.completed = true;
        emit ZoneCompleted(
            user,
            zoneId,
            details.distractionScore,
            details.productivityScore,
            details.finalDuration,
            zone.attestationId
        );
    }

    function calculateReward(
        uint256 distractionScore, // 分心次數
        uint256 productivityScore, // 生產力 1-10 放大1000倍處理
        uint256 finalDuration, // 實際花費時間
        uint256 estimateDuration // 預計花費時間
    ) public pure returns (uint256) {
        // 保證 productivityScore 在合理範圍內 (1 到 10)
        if (productivityScore < 1000 || productivityScore > 10000) {
            revert InvalidProductivityScore();
        }

        // 計算 TimeWeight
        uint256 timeWeight;
        if (finalDuration <= estimateDuration) {
            // 預計時間內，獎勵隨著時間增加
            timeWeight = (finalDuration * 1000) / estimateDuration;
        } else {
            // 超過預計時間，獎勵隨著時間減少
            timeWeight = (estimateDuration * 1000) / finalDuration;
        }

        // 生產力加權計算，生產力原本是 1-10，放大1000倍處理
        uint256 productivityWeight = productivityScore;

        // 計算分數
        uint256 reward = (BASE_REWARD * timeWeight * productivityWeight) /
            (1000 * 10000); // 放大 1000 倍的處理

        // 扣除分心次數的分數
        uint256 totalPenalty = DISTRACTION_PENALTY * distractionScore;
        if (totalPenalty > reward) {
            reward = 0; // 確保獎勵不會小於0
        } else {
            reward -= totalPenalty;
        }

        // 返回結果，並將結果縮回到原來的範圍
        return (reward * 1e18) / 1000;
    }
}
