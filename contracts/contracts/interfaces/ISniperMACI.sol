// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {Params} from "maci-contracts/contracts/utilities/Params.sol"; // Import the Params contract
import {DomainObjs} from "maci-contracts/contracts/utilities/DomainObjs.sol"; // Import the DomainObjs contract

/// @title MACI - Minimum Anti-Collusion Infrastructure Version 1
/// @notice A contract which allows users to sign up, and deploy new polls
interface ISniperMACI {
    struct PollContracts {
        address poll;
        address messageProcessor;
        address tally;
    }

    function getNextPollId() external view returns (uint256);

    function getPoll(
        uint256 _pollId
    ) external view returns (PollContracts memory pollContracts);

    /// @notice Deploy a new Poll contract.
    /// @param _duration How long should the Poll last for
    /// @param _treeDepths The depth of the Merkle trees
    /// @param _coordinatorPubKey The coordinator's public key
    /// @param _verifier The Verifier Contract
    /// @param _vkRegistry The VkRegistry Contract
    /// @param _mode Voting mode
    function deployPoll(
        uint256 _duration,
        Params.TreeDepths memory _treeDepths,
        DomainObjs.PubKey memory _coordinatorPubKey,
        address _verifier,
        address _vkRegistry,
        DomainObjs.Mode _mode,
        address owner
    ) external;
}
