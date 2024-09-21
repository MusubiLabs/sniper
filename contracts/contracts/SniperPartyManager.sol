// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SniperPartyCredit} from "./SniperPartyCredit.sol"; // Import the Party Token contract
import {ISniper} from "./interfaces/ISniper.sol"; // Import the ISniper contract
import {MACI, IPollFactory, IMessageProcessorFactory, ITallyFactory, SignUpGatekeeper, InitialVoiceCreditProxy} from "maci-contracts/contracts/MACI.sol"; // Import the MACI contract
import {DomainObjs} from "maci-contracts/contracts/utilities/DomainObjs.sol"; // Import the DomainObjs contract
import {Params} from "maci-contracts/contracts/utilities/Params.sol"; // Import the Params contract
import {IPoll} from "maci-contracts/contracts/interfaces/IPoll.sol"; // Import the Params contract
import {ITally} from "./interfaces/ITally.sol"; // Import the Params contract


import {IWorldVerifier} from "./interfaces/IWorldVerifier.sol";
import "./error.sol";

contract PartyManager is Ownable(msg.sender) {    
    MACIConfig public maciConfig;
    PollConfig public pollConfig;

    // should be good for all tokens
    uint256 internal constant VOICE_CREDIT_FACTOR = 10e6;
    uint256 internal constant ALPHA_PRECISION = 10e18;
    struct Party {
        MACI maciInstance;
        uint256 pollId;
        SniperPartyCredit partyToken;
        uint256 endTime;
        bytes32 ipfsHash;
        uint256 numJoined;
        uint256 totalSpent;
        uint256 alpha;
        bool isFinalized;
        mapping(uint => address) recipientRegistry;
        mapping(address => bool) hasClaimedFunds;
    }

    struct MACIConfig {
        IPollFactory _pollFactory;
        IMessageProcessorFactory _messageProcessorFactory;
        ITallyFactory _tallyFactory;
        SignUpGatekeeper _signUpGatekeeper;
        InitialVoiceCreditProxy _initialVoiceCreditProxy;
        uint8 _stateTreeDepth;
        uint256[5] _emptyBallotRoots;
    }

    struct PollConfig {
        DomainObjs.PubKey coordinatorPubKey;
        Params.TreeDepths treeDepths;
        address verifier;
        address vkRegistry;
    }

    uint256 public nextParty;
    mapping(uint256 => Party) public activeParties;
    mapping(uint256 => uint256) public partyPool;

    IWorldVerifier public worldVerifier;
    IERC20 public usdcToken;
    ISniper public sniperContract; // The instance of the ISniper contract

    event PartyCreated(
        address indexed creator,
        address maciInstance,
        uint256 partyId,
        uint256 pollId,
        address partyToken,
        uint256 endTime
    );

    event PartyJoined(
        address indexed user,
        uint indexed partyId,
        uint indexed sessionId
    );
    event PartySponsored(
        address indexed user,
        uint256 amount,
        uint256 partyCoinsReceived
    );

    modifier onlyVerifiedUser() {
        if (!worldVerifier.isHuman(msg.sender)) {
            revert UnverifiedUser();
        }
        _;
    }

    constructor(
        IERC20 _usdcToken,
        ISniper _sniperContract,
        IWorldVerifier _worldVerifier,
        MACIConfig memory _maciConfig,
        PollConfig memory _pollConfig
    ) {
        usdcToken = _usdcToken;
        sniperContract = _sniperContract; // Reference to ISniper contract
        worldVerifier = _worldVerifier;

        maciConfig = _maciConfig;
        pollConfig = _pollConfig;
    }

    function createParty(
        uint256 partyEndTime,
        bytes32 ipfsHash
    ) external onlyVerifiedUser {
        if (partyEndTime <= block.timestamp) {
            revert InvalidPartyEndTime();
        }
        SniperPartyCredit partyToken = new SniperPartyCredit(address(this));
        MACI maciInstance = new MACI(
            maciConfig._pollFactory,
            maciConfig._messageProcessorFactory,
            maciConfig._tallyFactory,
            maciConfig._signUpGatekeeper,
            maciConfig._initialVoiceCreditProxy,
            maciConfig._stateTreeDepth,
            maciConfig._emptyBallotRoots
        );

        Party storage party = activeParties[nextParty];
        party.maciInstance = maciInstance;
        party.pollId = maciInstance.nextPollId();
        party.partyToken = partyToken;
        party.endTime = partyEndTime;
        party.ipfsHash = ipfsHash;

        maciInstance.deployPoll(
            partyEndTime - block.timestamp,
            pollConfig.treeDepths,
            pollConfig.coordinatorPubKey,
            pollConfig.verifier,
            pollConfig.vkRegistry,
            DomainObjs.Mode.QV
        );
        emit PartyCreated(
            msg.sender,
            address(maciInstance),
            nextParty,
            activeParties[nextParty].pollId,
            address(partyToken),
            partyEndTime
        );
        nextParty++;
    }

    function joinParty(uint256 partyId, address user) external {
        if (activeParties[partyId].endTime < block.timestamp) {
            revert PartyHasEnded();
        }
        // Register the user as a participant
        activeParties[partyId].recipientRegistry[
            activeParties[partyId].numJoined
        ] = user;
        activeParties[partyId].numJoined++;

        // Call ISniper contract to create a session for the user
        uint256 sessionId = sniperContract.createPartySniperZone(
            activeParties[partyId].endTime - block.timestamp, // Duration based on party end time
            block.timestamp, // Start time is now
            activeParties[partyId].ipfsHash, // IPFS hash of the party
            user // Pass the user address
        );

        emit PartyJoined(user, partyId, sessionId);
    }

    function sponsorParty(
        uint256 partyId,
        uint256 usdcAmount,
        address sponsor
    ) external {
        if (activeParties[partyId].endTime < block.timestamp) {
            revert PartyHasEnded();
        }

        usdcToken.transferFrom(sponsor, address(this), usdcAmount);
        activeParties[partyId].partyToken.mint(sponsor, usdcAmount);
        partyPool[partyId] += usdcAmount;

        emit PartySponsored(sponsor, usdcAmount, usdcAmount);
    }

    function claimFunds(
        uint256 partyId,
        uint256 _voteOptionIndex,
        uint256 _spent,
        uint256[][] calldata _proof,
        uint256 _spentSalt,
        uint256 _resultsCommitment,
        uint256 _spentVoiceCreditsCommitment
    ) external {
        MACI.PollContracts memory pollContracts = activeParties[partyId]
            .maciInstance
            .getPoll(activeParties[partyId].pollId);
        ITally tally = ITally(pollContracts.tally);

        // the ballots must have been tallied first
        if (!tally.isTallied()) revert BallotsNotTallied();

        (, , , uint8 voteOptionTreeDepth) = IPoll(pollContracts.poll)
            .treeDepths();

        // verify perVOProof
        if (
            !tally.verifyPerVOSpentVoiceCredits(
                _voteOptionIndex,
                _spent,
                _proof,
                _spentSalt,
                voteOptionTreeDepth,
                _spentVoiceCreditsCommitment,
                _resultsCommitment
            )
        ) revert InvalidPerVOSpentVoiceCreditsProof();

        // get the recipient address
        address recipient = activeParties[partyId].recipientRegistry[
            _voteOptionIndex
        ];
        // check that the recipient has not received their funds already
        if (activeParties[partyId].hasClaimedFunds[recipient])
            revert AlreadyClaimedFunds();
        // set so they cannot claim anymore
        activeParties[partyId].hasClaimedFunds[recipient] = true;

        // calculate the matching funds
        uint256 allocatedAmount = getAllocatedAmount(partyId, _spent);
        if (recipient != address(0)) {
            // transfer the token to the recipient
            usdcToken.transferFrom(address(this), recipient, allocatedAmount);
        }
    }

    /// @notice Finalize the round
    /// @param _totalSpent the total amount of spent voice credits
    /// @param _totalSpentSalt the salt used in the total spent voice credits commitment
    /// @param _newResultCommitment the new results commitment
    /// @param _perVOSpentVoiceCreditsHash the hash of the per vote option spent voice credits
    function finalizeParty(
        uint256 partyId,
        uint256 _totalSpent,
        uint256 _totalSpentSalt,
        uint256 _newResultCommitment,
        uint256 _perVOSpentVoiceCreditsHash
    ) external onlyOwner {
        Party storage party = activeParties[partyId];
        MACI.PollContracts memory pollContracts = activeParties[partyId]
            .maciInstance
            .getPoll(activeParties[partyId].pollId);
        ITally tally = ITally(pollContracts.tally);
        // cannot finalize twice
        if (party.isFinalized) revert AlreadyFinalized();
        party.isFinalized = true;

        // check that all ballots have been tallied
        if (!tally.isTallied()) revert BallotsNotTallied();

        // there must be at least one vote
        if (_totalSpent == 0) revert NoVotes();

        // verify proof
        if (
            !tally.verifySpentVoiceCredits(
                _totalSpent,
                _totalSpentSalt,
                _newResultCommitment,
                _perVOSpentVoiceCreditsHash
            )
        ) {
            revert InvalidSpentVoiceCreditsProof();
        }

        // store the total spent
        party.totalSpent = _totalSpent;

        // get balance and calculate matching pool size
        uint256 budget = partyPool[partyId];

        party.alpha = calcAlpha(budget, _totalSpent * _totalSpent, _totalSpent);
    }

    /// @notice Calculate the amount to distribute to a certain project
    /// @param _spent the amount of spent voice credits
    function getAllocatedAmount(
        uint256 partyId,
        uint256 _spent
    ) public view returns (uint256) {
        uint256 alpha = activeParties[partyId].alpha;
        uint256 quadratic = alpha * VOICE_CREDIT_FACTOR * _spent;
        uint256 totalSpentCredits = VOICE_CREDIT_FACTOR * _spent;
        uint256 linearPrecision = ALPHA_PRECISION * totalSpentCredits;
        uint256 linearAlpha = alpha * totalSpentCredits;

        return ((quadratic + linearPrecision) - linearAlpha) / ALPHA_PRECISION;
    }

    /// @dev Calculate the alpha for the capital constrained quadratic formula
    /// in page 17 of https://arxiv.org/pdf/1809.06421.pdf
    /// @param _budget Total budget of the round to be distributed
    /// @param _totalVotesSquares Total of the squares of votes
    /// @param _totalSpent Total amount of spent voice credits
    function calcAlpha(
        uint256 _budget,
        uint256 _totalVotesSquares,
        uint256 _totalSpent
    ) public pure returns (uint256 _alpha) {
        // make sure budget = contributions + matching pool
        uint256 contributions = _totalSpent * VOICE_CREDIT_FACTOR;

        if (_budget < contributions) {
            revert InvalidBudget();
        }

        // guard against division by zero.
        // This happens when no project receives more than one vote
        if (_totalVotesSquares <= _totalSpent) {
            revert NoProjectHasMoreThanOneVote();
        }

        return
            ((_budget - contributions) * 10e18) /
            (VOICE_CREDIT_FACTOR * (_totalVotesSquares - _totalSpent));
    }
}
