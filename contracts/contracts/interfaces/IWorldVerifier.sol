// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IWorldVerifier {
    function isHuman(address _user) external view returns (bool);
}