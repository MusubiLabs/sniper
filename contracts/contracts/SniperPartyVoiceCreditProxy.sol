// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {InitialVoiceCreditProxy} from "maci-contracts/contracts/initialVoiceCreditProxy/InitialVoiceCreditProxy.sol";

/// @title SniperPartyVoiceCreditProxy
/// @notice This contract allows to set a constant initial voice credit balance
/// for MACI's voters.
contract SniperPartyVoiceCreditProxy is InitialVoiceCreditProxy {
    /// @notice the balance to be returned by getVoiceCredits
    IERC20 sniperPartyCredit;

    /// @notice creates a new SniperPartyVoiceCreditProxy
    /// @param _sniperPartyCredit the token balance to be returned by getVoiceCredits
    constructor(IERC20 _sniperPartyCredit) payable {
        sniperPartyCredit = _sniperPartyCredit;
    }

    /// @notice Returns the constant balance for any new MACI's voter
    /// @return balance
    function getVoiceCredits(
        address user,
        bytes memory
    ) public view override returns (uint256) {
        return (sniperPartyCredit.balanceOf(user) / 10 ** 6);
    }
}
