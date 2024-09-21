import { getContract, PublicClient, WalletClient } from 'viem'
const abi = [
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: '_usdcToken',
        type: 'address'
      },
      {
        internalType: 'contract ISniper',
        name: '_sniperContract',
        type: 'address'
      },
      {
        internalType: 'contract IWorldVerifier',
        name: '_worldVerifier',
        type: 'address'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'sniperMACIFactory',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'pollFactory',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'messageProcessorFactory',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'tallyFactory',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'signUpGatekeeper',
            type: 'address'
          },
          {
            internalType: 'uint8',
            name: 'stateTreeDepth',
            type: 'uint8'
          },
          {
            internalType: 'uint256[5]',
            name: 'emptyBallotRoots',
            type: 'uint256[5]'
          }
        ],
        internalType: 'struct SniperPartyManager.MACIConfig',
        name: '_maciConfig',
        type: 'tuple'
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256'
              },
              {
                internalType: 'uint256',
                name: 'y',
                type: 'uint256'
              }
            ],
            internalType: 'struct DomainObjs.PubKey',
            name: 'coordinatorPubKey',
            type: 'tuple'
          },
          {
            components: [
              {
                internalType: 'uint8',
                name: 'intStateTreeDepth',
                type: 'uint8'
              },
              {
                internalType: 'uint8',
                name: 'messageTreeSubDepth',
                type: 'uint8'
              },
              {
                internalType: 'uint8',
                name: 'messageTreeDepth',
                type: 'uint8'
              },
              {
                internalType: 'uint8',
                name: 'voteOptionTreeDepth',
                type: 'uint8'
              }
            ],
            internalType: 'struct Params.TreeDepths',
            name: 'treeDepths',
            type: 'tuple'
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'vkRegistry',
            type: 'address'
          }
        ],
        internalType: 'struct SniperPartyManager.PollConfig',
        name: '_pollConfig',
        type: 'tuple'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'AlreadyClaimedFunds',
    type: 'error'
  },
  {
    inputs: [],
    name: 'AlreadyFinalized',
    type: 'error'
  },
  {
    inputs: [],
    name: 'BallotsNotTallied',
    type: 'error'
  },
  {
    inputs: [],
    name: 'InvalidPartyEndTime',
    type: 'error'
  },
  {
    inputs: [],
    name: 'InvalidPerVOSpentVoiceCreditsProof',
    type: 'error'
  },
  {
    inputs: [],
    name: 'InvalidSpentVoiceCreditsProof',
    type: 'error'
  },
  {
    inputs: [],
    name: 'NoVotes',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      }
    ],
    name: 'OwnableInvalidOwner',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error'
  },
  {
    inputs: [],
    name: 'PartyHasEnded',
    type: 'error'
  },
  {
    inputs: [],
    name: 'UnverifiedUser',
    type: 'error'
  },
  {
    inputs: [],
    name: 'UserAlreadyJoined',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'maciInstance',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'partyId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'pollId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'partyToken',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'votingEndTime',
        type: 'uint256'
      }
    ],
    name: 'PartyCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'partyId',
        type: 'uint256'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'zoneId',
        type: 'uint256'
      }
    ],
    name: 'PartyJoined',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'partyCoinsReceived',
        type: 'uint256'
      }
    ],
    name: 'PartySponsored',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'activeParties',
    outputs: [
      {
        internalType: 'address',
        name: 'maciInstance',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'pollId',
        type: 'uint256'
      },
      {
        internalType: 'contract PartyToken',
        name: 'partyToken',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'votingEndTime',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'ipfsHash',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'numJoined',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'totalSpent',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'alpha',
        type: 'uint256'
      },
      {
        internalType: 'bool',
        name: 'isFinalized',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'partyId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_voteOptionIndex',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_spent',
        type: 'uint256'
      },
      {
        internalType: 'uint256[][]',
        name: '_proof',
        type: 'uint256[][]'
      },
      {
        internalType: 'uint256',
        name: '_spentSalt',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_resultsCommitment',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_spentVoiceCreditsCommitment',
        type: 'uint256'
      }
    ],
    name: 'claimFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'partyEndTime',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'votingEndTime',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'ipfsHash',
        type: 'string'
      }
    ],
    name: 'createParty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'partyId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_totalSpent',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_totalSpentSalt',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_newResultCommitment',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_perVOSpentVoiceCreditsHash',
        type: 'uint256'
      }
    ],
    name: 'finalizeParty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'sniperContract',
    outputs: [
      {
        internalType: 'contract ISniper',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'partyId',
        type: 'uint256'
      }
    ],
    name: 'joinParty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'maciConfig',
    outputs: [
      {
        internalType: 'address',
        name: 'sniperMACIFactory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'pollFactory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'messageProcessorFactory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'tallyFactory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'signUpGatekeeper',
        type: 'address'
      },
      {
        internalType: 'uint8',
        name: 'stateTreeDepth',
        type: 'uint8'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'nextParty',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'partyPool',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pollConfig',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'y',
            type: 'uint256'
          }
        ],
        internalType: 'struct DomainObjs.PubKey',
        name: 'coordinatorPubKey',
        type: 'tuple'
      },
      {
        components: [
          {
            internalType: 'uint8',
            name: 'intStateTreeDepth',
            type: 'uint8'
          },
          {
            internalType: 'uint8',
            name: 'messageTreeSubDepth',
            type: 'uint8'
          },
          {
            internalType: 'uint8',
            name: 'messageTreeDepth',
            type: 'uint8'
          },
          {
            internalType: 'uint8',
            name: 'voteOptionTreeDepth',
            type: 'uint8'
          }
        ],
        internalType: 'struct Params.TreeDepths',
        name: 'treeDepths',
        type: 'tuple'
      },
      {
        internalType: 'address',
        name: 'verifier',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'vkRegistry',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'partyId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'usdcAmount',
        type: 'uint256'
      }
    ],
    name: 'sponsorParty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'usdcToken',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'worldVerifier',
    outputs: [
      {
        internalType: 'contract IWorldVerifier',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

interface Party {
  maciInstance: string
  pollId: bigint
  partyToken: string
  endTime: bigint
  votingEndTime: bigint
  ipfsHash: string
  numJoined: bigint
  totalSpent: bigint
  alpha: bigint
  isFinalized: boolean
}

export class SniperPartyManager {
  public contractAddress: string
  private contractAbi: any
  public publicClient: PublicClient
  private walletClient: WalletClient
  public contractInstance: any

  // Tips: Get the wallet client and public client from the dynamic context
  // import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
  // const { primaryWallet } = useDynamicContext();
  // const walletClient = await primaryWallet?.connector?.getWalletClient();
  constructor(contractAddress: string, publicClient: PublicClient, walletClient: WalletClient) {
    this.contractAddress = contractAddress
    this.contractAbi = abi
    this.walletClient = walletClient
    this.publicClient = publicClient
    this.contractInstance = this.getContractInstance()
  }

  private getContractInstance() {
    return getContract({
      address: this.contractAddress as `0x${string}`,
      abi: this.contractAbi,
      client: { public: this.publicClient, wallet: this.walletClient }
    })
  }

  // Create a new party
  async createParty(partyEndTime: bigint, votingEndTime: bigint, ipfsHash: string): Promise<any> {
    return this.contractInstance.write.createParty([partyEndTime, votingEndTime, ipfsHash])
  }

  // Join an existing party
  async joinParty(partyId: bigint): Promise<any> {
    return this.contractInstance.write.joinParty([partyId])
  }

  // Sponsor a party
  async sponsorParty(partyId: bigint, usdcAmount: bigint): Promise<any> {
    return this.contractInstance.write.sponsorParty([partyId, usdcAmount])
  }

  // Claim funds from a party after voting has ended and the party has been finalized
  async claimFunds(
    partyId: bigint,
    voteOptionIndex: bigint,
    spent: bigint,
    proof: bigint[][],
    spentSalt: bigint,
    resultsCommitment: bigint,
    spentVoiceCreditsCommitment: bigint
  ): Promise<any> {
    return this.contractInstance.write.claimFunds([
      partyId,
      voteOptionIndex,
      spent,
      proof,
      spentSalt,
      resultsCommitment,
      spentVoiceCreditsCommitment
    ])
  }

  // Get the details of an active party
  async getActiveParty(partyId: bigint): Promise<Party> {
    return this.contractInstance.read.activeParties([partyId])
  }

  // Get the USDC token this.contractInstance address
  async getUsdcToken(): Promise<string> {
    return this.contractInstance.read.usdcToken()
  }
}
