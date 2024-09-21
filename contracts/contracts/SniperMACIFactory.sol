// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SniperPartyCredit} from "./SniperPartyCredit.sol"; // Import the Party Token contract
import {SniperMACI, IPollFactory, IMessageProcessorFactory, ITallyFactory} from "./SniperMACI.sol"; // Import the MACI contract
import {SniperSPGatekeeper} from "./SniperSPGatekeeper.sol"; // Import the SniperSPGatekeeper contract
import {SniperPartyVoiceCreditProxy} from "./SniperPartyVoiceCreditProxy.sol"; // Import the SniperPartyVoiceCreditProxy contract
import {ISniperMACIFactory} from "./interfaces/ISniperMACIFactory.sol";

contract SniperMACIFactory is ISniperMACIFactory {
    function deploy(
        address _pollFactory,
        address _messageProcessorFactory,
        address _tallyFactory,
        address _signUpGatekeeper,
        uint8 _stateTreeDepth,
        uint256[5] memory _emptyBallotRoots
    ) public returns (address,address) {
        SniperPartyCredit sniperPartyCredit = new SniperPartyCredit(msg.sender);
        SniperPartyVoiceCreditProxy voiceCreditProxy = new SniperPartyVoiceCreditProxy(
                sniperPartyCredit
            );
        SniperMACI sniperMaci = new SniperMACI(
            IPollFactory(_pollFactory),
            IMessageProcessorFactory(_messageProcessorFactory),
            ITallyFactory(_tallyFactory),
            SniperSPGatekeeper(_signUpGatekeeper),
            voiceCreditProxy,
            _stateTreeDepth,
            _emptyBallotRoots
        );

        SniperSPGatekeeper(_signUpGatekeeper).setMaciInstance(
            address(sniperMaci)
        );
        return (address(sniperMaci), address(sniperPartyCredit));
    }
}
