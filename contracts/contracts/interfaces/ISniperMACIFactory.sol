// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

/// @title ISniperMACIFactory
/// @notice SniperMACIFactory interface
interface ISniperMACIFactory {
    function deploy(
        address _pollFactory,
        address _messageProcessorFactory,
        address _tallyFactory,
        address _signUpGatekeeper,
        uint8 _stateTreeDepth,
        uint256[5] memory _emptyBallotRoots
    ) external returns (address,address);
}
