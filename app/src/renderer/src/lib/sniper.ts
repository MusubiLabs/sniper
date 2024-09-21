import { getContract, PublicClient, WalletClient } from 'viem';
const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_worldVerifier",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_signProtocol",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_rewardToken",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "_schemaId",
        "type": "uint64"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "InvalidPartyManager",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProductivityScore",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnverifiedUser",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZoneAlreadyFinalized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "zoneId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "distractionScore",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "productivityScore",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "finalDuration",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "attestationId",
        "type": "uint64"
      }
    ],
    "name": "ZoneCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "zoneId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "duration",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "attestationId",
            "type": "uint64"
          },
          {
            "internalType": "enum Sniper.ZoneMode",
            "name": "mode",
            "type": "uint8"
          }
        ],
        "indexed": false,
        "internalType": "struct Sniper.SniperZone",
        "name": "zone",
        "type": "tuple"
      }
    ],
    "name": "ZoneCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "distractionScore",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "productivityScore",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "finalDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "estimateDuration",
        "type": "uint256"
      }
    ],
    "name": "calculateReward",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "zoneId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "distractionScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "productivityScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "finalDuration",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          }
        ],
        "internalType": "struct Sniper.CompletedDetails",
        "name": "details",
        "type": "tuple"
      }
    ],
    "name": "completeZone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "createPartySniperZone",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "zoneId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "createSniperZone",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "zoneId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "partyManager",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "schemaId",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_partyManager",
        "type": "address"
      }
    ],
    "name": "setPartyManager",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "signProtocol",
    "outputs": [
      {
        "internalType": "contract ISP",
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
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userZones",
    "outputs": [
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      },
      {
        "internalType": "uint64",
        "name": "attestationId",
        "type": "uint64"
      },
      {
        "internalType": "enum Sniper.ZoneMode",
        "name": "mode",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "worldVerifier",
    "outputs": [
      {
        "internalType": "contract IWorldVerifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

interface SniperZone {
  ipfsHash: string;
  startTime: bigint;
  duration: bigint;
  completed: boolean;
  attestationId: bigint;
}

interface CompletedDetails {
  distractionScore: bigint;
  productivityScore: bigint;
  observations: string;
  assessment: string;
  feedback: string;
}

class SniperContract {
  private contractAddress: string;
  private contractAbi: any;
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private contractInstance: any;

  // Tips: Get the wallet client and public client from the dynamic context
  // import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
  // const { primaryWallet } = useDynamicContext();
  // const walletClient = await primaryWallet?.connector?.getWalletClient();
  constructor(
    contractAddress: string,
    publicClient: PublicClient,
    walletClient: WalletClient
  ) {
    this.contractAddress = contractAddress;
    this.contractAbi = abi;
    this.walletClient = walletClient;
    this.publicClient = publicClient;
    this.contractInstance = this.getContractInstance();
  }

  private getContractInstance() {
    return getContract({
      address: this.contractAddress as `0x${string}`,
      abi: this.contractAbi,
      client: { public: this.publicClient, wallet: this.walletClient },
    });
  }

  async createSniperZone(
    ipfsHash: string,
    startTime: bigint,
    duration: bigint
  ): Promise<any> {
    return this.contractInstance.write.createSniperZone([
      startTime,
      duration,
      ipfsHash,
    ]);
  }

  async completeZone(
    user: string,
    zoneId: bigint,
    details: CompletedDetails
  ): Promise<any> {
    return this.contractInstance.write.completeZone([
      user,
      zoneId,
      details,
    ]);
  }

  async getOwner(): Promise<string> {
    return this.contractInstance.read.owner();
  }

  async getRewardToken(): Promise<string> {
    return this.contractInstance.read.rewardToken();
  }

  async getSchemaId(): Promise<bigint> {
    return this.contractInstance.read.schemaId();
  }

  async getSignProtocol(): Promise<string> {
    return this.contractInstance.read.signProtocol();
  }

  async getUserZone(user: string, zoneId: bigint): Promise<SniperZone> {
    return this.contractInstance.read.userZones([user, zoneId]);
  }
}

export { SniperContract };
