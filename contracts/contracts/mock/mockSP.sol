// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@ethsign/sign-protocol-evm/src/core/SP.sol";

contract MockSP is SP {
    constructor() SP() {}
}