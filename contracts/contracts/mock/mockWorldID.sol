// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IWorldID.sol";

contract MockWorldID is IWorldID {
    constructor() IWorldID() {}


    function verifyProof(
        uint256, // root,
        uint256, // signalHash,
        uint256, // nullifierHash,
        uint256, // externalNullifierHash,
        uint256[8] calldata // proof
    ) external pure{
        require(true, "MockWorldID: Invalid proof");
    }

}