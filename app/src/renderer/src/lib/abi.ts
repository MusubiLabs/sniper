export const maciAbi = [
    {
        "inputs": [
            {
                "internalType": "contract IPollFactory",
                "name": "_pollFactory",
                "type": "address"
            },
            {
                "internalType": "contract IMessageProcessorFactory",
                "name": "_messageProcessorFactory",
                "type": "address"
            },
            {
                "internalType": "contract ITallyFactory",
                "name": "_tallyFactory",
                "type": "address"
            },
            {
                "internalType": "contract SignUpGatekeeper",
                "name": "_signUpGatekeeper",
                "type": "address"
            },
            {
                "internalType": "contract InitialVoiceCreditProxy",
                "name": "_initialVoiceCreditProxy",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "_stateTreeDepth",
                "type": "uint8"
            },
            {
                "internalType": "uint256[5]",
                "name": "_emptyBallotRoots",
                "type": "uint256[5]"
            }
        ],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "DefaultZeroBadIndex",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "DepthTooLarge",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidMessage",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidPubKey",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NumberOfLeavesCannotBeZero",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pollId",
                "type": "uint256"
            }
        ],
        "name": "PollDoesNotExist",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PoseidonHashLibrariesNotLinked",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TooManySignups",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_pollId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_coordinatorPubKeyX",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_coordinatorPubKeyY",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "enum DomainObjs.Mode",
                "name": "_mode",
                "type": "uint8"
            }
        ],
        "name": "DeployPoll",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_stateIndex",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_userPubKeyX",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_userPubKeyY",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_voiceCreditBalance",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_timestamp",
                "type": "uint256"
            }
        ],
        "name": "SignUp",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "MESSAGE_DATA_LENGTH",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_duration",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "intStateTreeDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "messageTreeSubDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "messageTreeDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "voteOptionTreeDepth",
                        "type": "uint8"
                    }
                ],
                "internalType": "struct Params.TreeDepths",
                "name": "_treeDepths",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "_coordinatorPubKey",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "_verifier",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_vkRegistry",
                "type": "address"
            },
            {
                "internalType": "enum DomainObjs.Mode",
                "name": "_mode",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "deployPoll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_duration",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "intStateTreeDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "messageTreeSubDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "messageTreeDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "voteOptionTreeDepth",
                        "type": "uint8"
                    }
                ],
                "internalType": "struct Params.TreeDepths",
                "name": "_treeDepths",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "_coordinatorPubKey",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "_verifier",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_vkRegistry",
                "type": "address"
            },
            {
                "internalType": "enum DomainObjs.Mode",
                "name": "_mode",
                "type": "uint8"
            }
        ],
        "name": "deployPoll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "emptyBallotRoots",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getNextPollId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pollId",
                "type": "uint256"
            }
        ],
        "name": "getPoll",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "poll",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "messageProcessor",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tally",
                        "type": "address"
                    }
                ],
                "internalType": "struct MACI.PollContracts",
                "name": "pollContracts",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getStateTreeRoot",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "root",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[2]",
                "name": "array",
                "type": "uint256[2]"
            }
        ],
        "name": "hash2",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[3]",
                "name": "array",
                "type": "uint256[3]"
            }
        ],
        "name": "hash3",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[4]",
                "name": "array",
                "type": "uint256[4]"
            }
        ],
        "name": "hash4",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[5]",
                "name": "array",
                "type": "uint256[5]"
            }
        ],
        "name": "hash5",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "left",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "right",
                "type": "uint256"
            }
        ],
        "name": "hashLeftRight",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256[10]",
                        "name": "data",
                        "type": "uint256[10]"
                    }
                ],
                "internalType": "struct DomainObjs.Message",
                "name": "_message",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "_encPubKey",
                "type": "tuple"
            }
        ],
        "name": "hashMessageAndEncPubKey",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "msgHash",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "x",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "y",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct DomainObjs.PubKey",
                        "name": "pubKey",
                        "type": "tuple"
                    },
                    {
                        "internalType": "uint256",
                        "name": "voiceCreditBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.StateLeaf",
                "name": "_stateLeaf",
                "type": "tuple"
            }
        ],
        "name": "hashStateLeaf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ciphertext",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "initialVoiceCreditProxy",
        "outputs": [
            {
                "internalType": "contract InitialVoiceCreditProxy",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lazyIMTData",
        "outputs": [
            {
                "internalType": "uint40",
                "name": "maxIndex",
                "type": "uint40"
            },
            {
                "internalType": "uint40",
                "name": "numberOfLeaves",
                "type": "uint40"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "maxSignups",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "messageProcessorFactory",
        "outputs": [
            {
                "internalType": "contract IMessageProcessorFactory",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextPollId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "numSignUps",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "signUps",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[2]",
                "name": "dataToPad",
                "type": "uint256[2]"
            }
        ],
        "name": "padAndHashMessage",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256[10]",
                        "name": "data",
                        "type": "uint256[10]"
                    }
                ],
                "internalType": "struct DomainObjs.Message",
                "name": "message",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "padKey",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "msgHash",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pollFactory",
        "outputs": [
            {
                "internalType": "contract IPollFactory",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "polls",
        "outputs": [
            {
                "internalType": "address",
                "name": "poll",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "messageProcessor",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tally",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "array",
                "type": "uint256[]"
            }
        ],
        "name": "sha256Hash",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "_pubKey",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "_signUpGatekeeperData",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "_initialVoiceCreditProxyData",
                "type": "bytes"
            }
        ],
        "name": "signUp",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "signUpGatekeeper",
        "outputs": [
            {
                "internalType": "contract SignUpGatekeeper",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stateTreeDepth",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tallyFactory",
        "outputs": [
            {
                "internalType": "contract ITallyFactory",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
export const pollAbi = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_duration",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "intStateTreeDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "messageTreeSubDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "messageTreeDepth",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "voteOptionTreeDepth",
                        "type": "uint8"
                    }
                ],
                "internalType": "struct Params.TreeDepths",
                "name": "_treeDepths",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "_coordinatorPubKey",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "contract IMACI",
                        "name": "maci",
                        "type": "address"
                    },
                    {
                        "internalType": "contract AccQueue",
                        "name": "messageAq",
                        "type": "address"
                    }
                ],
                "internalType": "struct Params.ExtContracts",
                "name": "_extContracts",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "_emptyBallotRoot",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "InvalidBatchLength",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidMessage",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidPubKey",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PollAlreadyInit",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "StateAlreadyMerged",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TooManyMessages",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "VotingPeriodNotOver",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "VotingPeriodOver",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_stateRoot",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_numSignups",
                "type": "uint256"
            }
        ],
        "name": "MergeMaciState",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_messageRoot",
                "type": "uint256"
            }
        ],
        "name": "MergeMessageAq",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_numSrQueueOps",
                "type": "uint256"
            }
        ],
        "name": "MergeMessageAqSubRoots",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256[10]",
                        "name": "data",
                        "type": "uint256[10]"
                    }
                ],
                "indexed": false,
                "internalType": "struct DomainObjs.Message",
                "name": "_message",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "indexed": false,
                "internalType": "struct DomainObjs.PubKey",
                "name": "_encPubKey",
                "type": "tuple"
            }
        ],
        "name": "PublishMessage",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "MESSAGE_DATA_LENGTH",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "actualStateTreeDepth",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "coordinatorPubKey",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "coordinatorPubKeyHash",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentSbCommitment",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emptyBallotRoot",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "extContracts",
        "outputs": [
            {
                "internalType": "contract IMACI",
                "name": "maci",
                "type": "address"
            },
            {
                "internalType": "contract AccQueue",
                "name": "messageAq",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDeployTimeAndDuration",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "pollDeployTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pollDuration",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[2]",
                "name": "array",
                "type": "uint256[2]"
            }
        ],
        "name": "hash2",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[3]",
                "name": "array",
                "type": "uint256[3]"
            }
        ],
        "name": "hash3",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[4]",
                "name": "array",
                "type": "uint256[4]"
            }
        ],
        "name": "hash4",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[5]",
                "name": "array",
                "type": "uint256[5]"
            }
        ],
        "name": "hash5",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "left",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "right",
                "type": "uint256"
            }
        ],
        "name": "hashLeftRight",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256[10]",
                        "name": "data",
                        "type": "uint256[10]"
                    }
                ],
                "internalType": "struct DomainObjs.Message",
                "name": "_message",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "_encPubKey",
                "type": "tuple"
            }
        ],
        "name": "hashMessageAndEncPubKey",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "msgHash",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "x",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "y",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct DomainObjs.PubKey",
                        "name": "pubKey",
                        "type": "tuple"
                    },
                    {
                        "internalType": "uint256",
                        "name": "voiceCreditBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.StateLeaf",
                "name": "_stateLeaf",
                "type": "tuple"
            }
        ],
        "name": "hashStateLeaf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ciphertext",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "init",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "maxMessages",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mergeMaciState",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mergeMessageAq",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_numSrQueueOps",
                "type": "uint256"
            }
        ],
        "name": "mergeMessageAqSubRoots",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mergedStateRoot",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "numMessages",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "numSignUpsAndMessages",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "numSUps",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "numMsgs",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "numSignups",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[2]",
                "name": "dataToPad",
                "type": "uint256[2]"
            }
        ],
        "name": "padAndHashMessage",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256[10]",
                        "name": "data",
                        "type": "uint256[10]"
                    }
                ],
                "internalType": "struct DomainObjs.Message",
                "name": "message",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "padKey",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "msgHash",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256[10]",
                        "name": "data",
                        "type": "uint256[10]"
                    }
                ],
                "internalType": "struct DomainObjs.Message",
                "name": "_message",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey",
                "name": "_encPubKey",
                "type": "tuple"
            }
        ],
        "name": "publishMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256[10]",
                        "name": "data",
                        "type": "uint256[10]"
                    }
                ],
                "internalType": "struct DomainObjs.Message[]",
                "name": "_messages",
                "type": "tuple[]"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "x",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "y",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DomainObjs.PubKey[]",
                "name": "_encPubKeys",
                "type": "tuple[]"
            }
        ],
        "name": "publishMessageBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "array",
                "type": "uint256[]"
            }
        ],
        "name": "sha256Hash",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stateMerged",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "treeDepths",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "intStateTreeDepth",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "messageTreeSubDepth",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "messageTreeDepth",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "voteOptionTreeDepth",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]