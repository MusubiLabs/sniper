// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISPHook, IERC20} from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {SniperCoin} from "./SniperCoin.sol";
import {IWorldVerifier} from "./interfaces/IWorldVerifier.sol";
import {UnauthorizedAttester} from "./error.sol";

contract SniperSPHook is ISPHook, Ownable(msg.sender) {
    mapping(address attester => bool allowed) public whitelist;
    IWorldVerifier public worldVerifier;

    constructor() {}

    function setWorldVerifier(address _worldVerifier) external onlyOwner {
        worldVerifier = IWorldVerifier(_worldVerifier);
    }

    function setWhitelist(address attester, bool allowed) external onlyOwner {
        whitelist[attester] = allowed;
    }

    function _checkAttesterWhitelistStatus(address attester) internal view {
        if (!whitelist[attester]) {
            revert UnauthorizedAttester();
        }
    }

    function _checkRecepientWhitelistStatus(address attester) internal view {
        require(
            worldVerifier.isHuman(attester),
            "Attester not verified by WorldID"
        );
    }

    function didReceiveAttestation(
        address attester,
        uint64, // schemaId,
        uint64, // attestationId,
        bytes calldata //extraData
    ) external payable {
        _checkAttesterWhitelistStatus(attester);
    }

    function didReceiveAttestation(
        address attester,
        uint64, //schemaId,
        uint64, //attestationId,
        IERC20 resolverFeeERC20Token,
        uint256 resolverFeeERC20Amount,
        bytes calldata extraData
    ) external {
        address recipient = abi.decode(extraData, (address));
        _checkAttesterWhitelistStatus(attester);
        _checkRecepientWhitelistStatus(recipient);
        SniperCoin(address(resolverFeeERC20Token)).mint(
            recipient,
            resolverFeeERC20Amount
        );
    }

    function didReceiveRevocation(
        address attester,
        uint64, // schemaId,
        uint64, // attestationId,
        bytes calldata //extraData
    ) external payable {
        _checkAttesterWhitelistStatus(attester);
    }

    function didReceiveRevocation(
        address attester,
        uint64, //schemaId,
        uint64, // attestationId,
        IERC20, // resolverFeeERC20Token,
        uint256, // resolverFeeERC20Amount,
        bytes calldata //extraData
    ) external view {
        _checkAttesterWhitelistStatus(attester);
    }
}
