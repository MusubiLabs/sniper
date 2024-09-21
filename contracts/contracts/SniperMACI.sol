// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "maci-contracts/contracts/MACI.sol";

/// @title MACI - Minimum Anti-Collusion Infrastructure Version 1
/// @notice A contract which allows users to sign up, and deploy new polls
contract SniperMACI is MACI {
    /// @notice Create a new instance of the MACI contract.
    /// @param _pollFactory The PollFactory contract
    /// @param _messageProcessorFactory The MessageProcessorFactory contract
    /// @param _tallyFactory The TallyFactory contract
    /// @param _signUpGatekeeper The SignUpGatekeeper contract
    /// @param _initialVoiceCreditProxy The InitialVoiceCreditProxy contract
    /// @param _stateTreeDepth The depth of the state tree
    /// @param _emptyBallotRoots The roots of the empty ballot trees
    constructor(
        IPollFactory _pollFactory,
        IMessageProcessorFactory _messageProcessorFactory,
        ITallyFactory _tallyFactory,
        SignUpGatekeeper _signUpGatekeeper,
        InitialVoiceCreditProxy _initialVoiceCreditProxy,
        uint8 _stateTreeDepth,
        uint256[5] memory _emptyBallotRoots
    )
        payable
        MACI(
            _pollFactory,
            _messageProcessorFactory,
            _tallyFactory,
            _signUpGatekeeper,
            _initialVoiceCreditProxy,
            _stateTreeDepth,
            _emptyBallotRoots
        )
    {}

    function getNextPollId() public view returns (uint256) {
        return nextPollId;
    }

    /// @notice Deploy a new Poll contract.
    /// @param _duration How long should the Poll last for
    /// @param _treeDepths The depth of the Merkle trees
    /// @param _coordinatorPubKey The coordinator's public key
    /// @param _verifier The Verifier Contract
    /// @param _vkRegistry The VkRegistry Contract
    /// @param _mode Voting mode
    function deployPoll(
        uint256 _duration,
        TreeDepths memory _treeDepths,
        PubKey memory _coordinatorPubKey,
        address _verifier,
        address _vkRegistry,
        Mode _mode,
        address owner
    ) public {
        // cache the poll to a local variable so we can increment it
        uint256 pollId = nextPollId;

        // Increment the poll ID for the next poll
        // 2 ** 256 polls available
        unchecked {
            nextPollId++;
        }

        // check coordinator key is a valid point on the curve
        if (
            !CurveBabyJubJub.isOnCurve(
                _coordinatorPubKey.x,
                _coordinatorPubKey.y
            )
        ) {
            revert InvalidPubKey();
        }

        uint256 voteOptionTreeDepth = _treeDepths.voteOptionTreeDepth;

        address p = pollFactory.deploy(
            _duration,
            _treeDepths,
            _coordinatorPubKey,
            address(this),
            emptyBallotRoots[voteOptionTreeDepth - 1]
        );

        address mp = messageProcessorFactory.deploy(
            _verifier,
            _vkRegistry,
            p,
            owner,
            _mode
        );
        address tally = tallyFactory.deploy(
            _verifier,
            _vkRegistry,
            p,
            mp,
            owner,
            _mode
        );

        // store the addresses in a struct so they can be returned
        PollContracts memory pollAddr = PollContracts({
            poll: p,
            messageProcessor: mp,
            tally: tally
        });

        polls[pollId] = pollAddr;

        emit DeployPoll(
            pollId,
            _coordinatorPubKey.x,
            _coordinatorPubKey.y,
            _mode
        );
    }
}
