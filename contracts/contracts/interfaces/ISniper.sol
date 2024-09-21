//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WorldID Interface
/// @author Worldcoin
/// @notice The interface to the proof verification for WorldID.
interface ISniper {
    function createPartySniperZone(
        uint256 duration,
        uint256 startTime,
        string memory ipfsHash,
        address user
    ) external returns (uint256 zoneId);
}
