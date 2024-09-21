import { getContract, PublicClient, WalletClient } from 'viem'
const abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sp',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_worldId',
        type: 'address'
      },
      {
        internalType: 'uint64',
        name: '_schemaId',
        type: 'uint64'
      },
      {
        internalType: 'string',
        name: '_appId',
        type: 'string'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'InvalidNullifier',
    type: 'error'
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address'
      }
    ],
    name: 'Verify',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'isHuman',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'schemaId',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'signProtocol',
    outputs: [
      {
        internalType: 'contract ISP',
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
        name: 'root',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'nullifierHash',
        type: 'uint256'
      },
      {
        internalType: 'uint256[8]',
        name: 'proof',
        type: 'uint256[8]'
      }
    ],
    name: 'verifyWorldAction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
class WorldVerifierContract {
  private contractAddress: string
  private contractAbi: any
  private walletClient: WalletClient
  public publicClient: PublicClient
  private contractInstance: any

  // Tips: Get the wallet client and public client from the dynamic context
  // import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
  // const { primaryWallet } = useDynamicContext();
  // const walletClient = await primaryWallet?.connector?.getWalletClient();
  // const publicClient = await primaryWallet?.connector?.getPublicClient();
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

  async verifyWorldAction(
    root: bigint,
    nullifierHash: bigint,
    proof: readonly bigint[]
  ): Promise<any> {
    return await this.contractInstance.write.verifyWorldAction([root, nullifierHash, proof])
  }

  async isHuman(address: string): Promise<boolean> {
    return this.contractInstance.read.isHuman([address])
  }

  async getSchemaId(): Promise<bigint> {
    return this.contractInstance.read.schemaId()
  }

  async getSignProtocol(): Promise<string> {
    return this.contractInstance.read.signProtocol()
  }
}

export { WorldVerifierContract }
