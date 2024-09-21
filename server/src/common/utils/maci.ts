import { ethers, Wallet } from 'ethers';
import {
  genProofs,
  getPoll,
  mergeMessages,
  mergeSignups,
  proveOnChain,
  TallyData,
  VerifyArgs,
} from 'maci-cli';
import {
  genTreeCommitment as genTallyResultCommitment,
  hash2,
  hash5,
  IncrementalQuinTree,
} from 'maci-crypto';
const path = require('path');
const fs = require('fs');
const zkeysPath = path.join(__dirname, '..', '..', '..', '/zkeys');
const finalizePath = path.join(__dirname, '..', '..', '..', '/finalize');
const proofPath = path.join(finalizePath, '/proofs');
const tallyPath = path.join(finalizePath, '/tallys');

const createDirectory = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true }, (err) => console.log);
    console.log(`Directory ${dirPath} created successfully!`);
  } catch (err) {
    console.error(`Error creating directory: ${err}`);
  }
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    console.log('File exists');
    return true;
  } catch (err) {
    console.log('File does not exist');
    return false;
  }
};

// Usage
createDirectory(proofPath);
createDirectory(tallyPath);
// Define the ABI for the SniperPartyManager contract
const SNIPER_PARTY_MANAGER_ABI = [
    {
      "inputs": [
        {
          "internalType": "contract IERC20",
          "name": "_usdcToken",
          "type": "address"
        },
        {
          "internalType": "contract ISniper",
          "name": "_sniperContract",
          "type": "address"
        },
        {
          "internalType": "contract IWorldVerifier",
          "name": "_worldVerifier",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "sniperMACIFactory",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "pollFactory",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "messageProcessorFactory",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "tallyFactory",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "signUpGatekeeper",
              "type": "address"
            },
            {
              "internalType": "uint8",
              "name": "stateTreeDepth",
              "type": "uint8"
            },
            {
              "internalType": "uint256[5]",
              "name": "emptyBallotRoots",
              "type": "uint256[5]"
            }
          ],
          "internalType": "struct SniperPartyManager.MACIConfig",
          "name": "_maciConfig",
          "type": "tuple"
        },
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
              "name": "coordinatorPubKey",
              "type": "tuple"
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
              "name": "treeDepths",
              "type": "tuple"
            },
            {
              "internalType": "address",
              "name": "verifier",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "vkRegistry",
              "type": "address"
            }
          ],
          "internalType": "struct SniperPartyManager.PollConfig",
          "name": "_pollConfig",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AlreadyClaimedFunds",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AlreadyFinalized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BallotsNotTallied",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPartyEndTime",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPerVOSpentVoiceCreditsProof",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidSpentVoiceCreditsProof",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoVotes",
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
      "name": "PartyHasEnded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnverifiedUser",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UserAlreadyJoined",
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
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "maciInstance",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "partyId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "pollId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "sniperPartyCredit",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "votingEndTime",
          "type": "uint256"
        }
      ],
      "name": "PartyCreated",
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
          "indexed": true,
          "internalType": "uint256",
          "name": "partyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "zoneId",
          "type": "uint256"
        }
      ],
      "name": "PartyJoined",
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
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "partyCoinsReceived",
          "type": "uint256"
        }
      ],
      "name": "PartySponsored",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "activeParties",
      "outputs": [
        {
          "internalType": "address",
          "name": "maciInstance",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "pollId",
          "type": "uint256"
        },
        {
          "internalType": "contract SniperPartyCredit",
          "name": "sniperPartyCredit",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "votingEndTime",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "numJoined",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalSpent",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "alpha",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isFinalized",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "partyId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_voteOptionIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_spent",
          "type": "uint256"
        },
        {
          "internalType": "uint256[][]",
          "name": "_proof",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256",
          "name": "_spentSalt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_resultsCommitment",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_spentVoiceCreditsCommitment",
          "type": "uint256"
        }
      ],
      "name": "claimFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "partyEndTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "votingEndTime",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "name": "createParty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "partyId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_totalSpent",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_totalSpentSalt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_newResultCommitment",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_perVOSpentVoiceCreditsHash",
          "type": "uint256"
        }
      ],
      "name": "finalizeParty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "partyId",
          "type": "uint256"
        }
      ],
      "name": "joinParty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "maciConfig",
      "outputs": [
        {
          "internalType": "address",
          "name": "sniperMACIFactory",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "pollFactory",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "messageProcessorFactory",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tallyFactory",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "signUpGatekeeper",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "stateTreeDepth",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextParty",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "partyPool",
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
      "name": "pollConfig",
      "outputs": [
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
          "name": "coordinatorPubKey",
          "type": "tuple"
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
          "name": "treeDepths",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "verifier",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "vkRegistry",
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
      "name": "sniperContract",
      "outputs": [
        {
          "internalType": "contract ISniper",
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
          "name": "partyId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "usdcAmount",
          "type": "uint256"
        }
      ],
      "name": "sponsorParty",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "inputs": [],
      "name": "usdcToken",
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

const MACI_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_pollId',
        type: 'uint256',
      },
    ],
    name: 'getPoll',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'poll',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'messageProcessor',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'tally',
            type: 'address',
          },
        ],
        internalType: 'struct MACI.PollContracts',
        name: 'pollContracts',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'polls',
    outputs: [
      {
        internalType: 'address',
        name: 'poll',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'messageProcessor',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tally',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
const TALLY_ABI = [
  {
    inputs: [],
    name: 'isTallied',
    outputs: [
      {
        internalType: 'bool',
        name: 'tallied',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export interface Tally {
  partyId: string;
  provider: string;
  maci: string;
  pollId: string;
  newTallyCommitment: string;
  results: {
    commitment: string;
    tally: string[];
    salt: string;
  };
  totalSpentVoiceCredits: {
    spent: string;
    commitment: string;
    salt: string;
  };
  perVOSpentVoiceCredits: {
    commitment: string;
    tally: string[];
    salt: string;
  };
}
/**
 * Read a JSON file from disk
 * @param path - the path of the file
 * @returns the JSON object
 */
export const readJSONFile = async (
  path: string,
): Promise<Record<string, Record<string, string> | undefined>> => {
  const isExists = fs.existsSync(path);

  if (!isExists) {
    console.log(`File ${path} does not exist`);
  }

  return JSON.parse(
    await fs.promises.readFile(path).then((res) => res.toString()),
  ) as Record<string, Record<string, string> | undefined>;
};

export const verifyArgs = async (
  partyId,
): Promise<Omit<VerifyArgs, 'signer'>> => {
  const tallyData = (await readJSONFile(
    `${tallyPath}/${partyId}_tally.json`,
  )) as unknown as TallyData;

  return {
    pollId: BigInt(tallyData.pollId),
    tallyData,
    maciAddress: tallyData.maci,
  };
};

export const finalizeParty = async (
  partyId: bigint,
  totalSpent: bigint,
  totalSpentSalt: bigint,
  resultsCommitment: bigint,
  perVOSpentVoiceCreditsCommitment: bigint,
  wallet: Wallet,
) => {
  try {
    const contractAddress = process.env.SNIPER_PARTY_MANAGER;

    // Connect to the contract
    const partyManager = new ethers.Contract(
      contractAddress,
      SNIPER_PARTY_MANAGER_ABI,
      wallet,
    );
    // Call the finalizeParty method
    const tx = await partyManager.finalizeParty(
      partyId,
      totalSpent,
      totalSpentSalt,
      resultsCommitment,
      perVOSpentVoiceCreditsCommitment,
    );

    console.log('Transaction sent, waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
  } catch (error) {
    console.error('Error finalizing party:', error);
  }
};

const isStateMerged = async (
  pollId: bigint,
  maciAddress: string,
  provider,
  signer,
) => {
  const poll = await getPoll({ pollId, maciAddress, provider, signer });

  return poll.isMerged;
};

const isTallied = async (
  pollId: bigint,
  maciAddress: string,
  provider,
  signer,
) => {
  const maciContract = new ethers.Contract(maciAddress, MACI_ABI, signer);
  const pollContracts = await maciContract.polls(pollId);
  const tallyContract = new ethers.Contract(
    pollContracts.tally,
    TALLY_ABI,
    signer,
  );
  return await tallyContract.isTallied();
};

export const getTally = (partyId: bigint): Tally => {
  try {
    const tally = require(`${tallyPath}/${partyId}_tally.json`);
    tally.partyId = partyId.toString();
    return tally;
  } catch (error) {
    return {
      partyId: partyId.toString(),
      provider: '',
      maci: '',
      pollId: '',
      newTallyCommitment: '',
      results: { commitment: '', tally: [], salt: '' },
      totalSpentVoiceCredits: { spent: '', commitment: '', salt: '' },
      perVOSpentVoiceCredits: { commitment: '', tally: [], salt: '' },
    };
  }
};

export function getRecipientClaimData(
  partyId: bigint,
  recipientIndex: number,
  recipientTreeDepth: number,
) {
  const tally = getTally(partyId);
  const maxRecipients = tally.perVOSpentVoiceCredits.tally.length;
  if (recipientIndex >= maxRecipients) {
    throw new Error(`Invalid recipient index ${recipientIndex}.`);
  }

  // Create proof for total amount of spent voice credits
  const spent = tally.perVOSpentVoiceCredits.tally[recipientIndex];
  const spentSalt = tally.perVOSpentVoiceCredits.salt;
  const spentTree = new IncrementalQuinTree(
    recipientTreeDepth,
    BigInt(0),
    5,
    hash5,
  );
  for (const leaf of tally.perVOSpentVoiceCredits.tally) {
    spentTree.insert(BigInt(leaf));
  }
  const spentProof = spentTree.genProof(recipientIndex);

  const resultsCommitment = genTallyResultCommitment(
    tally.results.tally.map((x) => BigInt(x)),
    BigInt(tally.results.salt),
    recipientTreeDepth,
  );

  const spentVoiceCreditsCommitment = hash2([
    BigInt(tally.totalSpentVoiceCredits.spent),
    BigInt(tally.totalSpentVoiceCredits.salt),
  ]);

  return [
    recipientIndex,
    spent,
    spentProof.pathElements.map((x) => x.map((y) => y.toString())),
    spentSalt,
    resultsCommitment?.toString(),
    spentVoiceCreditsCommitment?.toString(),
  ];
}

export const tallyVotes = async (
  partyId: bigint,
  pollId: bigint,
  maciAddress: string,
) => {
  try {
    console.log(partyId, pollId, maciAddress);
    // Initialize provider and signer (wallet)
    const providerUrl = process.env.PROVIDER_URL;

    // Initialize ethers provider and signer
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new Wallet(privateKey, provider);
    await mergeMessages({ pollId, maciAddress, signer: wallet });
    if (!(await isStateMerged(pollId, maciAddress, provider, wallet))) {
      console.log('merging signups');
      await mergeSignups({ pollId, maciAddress, signer: wallet });
    }

    if (getTally(partyId).results.tally.length === 0) {
      console.log('gen proofs');
      await genProofs({
        outputDir: `${proofPath}/${partyId}_proofs`,
        tallyFile: `${tallyPath}/${partyId}_tally.json`,
        tallyZkey: path.join(
          zkeysPath,
          '/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey',
        ),
        processZkey: path.join(
          zkeysPath,
          '/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey',
        ),
        pollId,
        processWitgen: path.join(
          zkeysPath,
          '/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_cpp/ProcessMessages_10-2-1-2_test',
        ),
        processDatFile: path.join(
          zkeysPath,
          '/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_cpp/ProcessMessages_10-2-1-2_test.dat',
        ),
        tallyWitgen: path.join(
          zkeysPath,
          '/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_cpp/TallyVotes_10-1-2_test',
        ),
        tallyDatFile: path.join(
          zkeysPath,
          '/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_cpp/TallyVotes_10-1-2_test.dat',
        ),
        coordinatorPrivKey: process.env.COORDINATOR_PRIVKEY,
        maciAddress,
        processWasm: path.join(
          zkeysPath,
          '/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_js/ProcessMessages_10-2-1-2_test.wasm',
        ),
        tallyWasm: path.join(
          zkeysPath,
          '/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_js/TallyVotes_10-1-2_test.wasm',
        ),
        useWasm: true,
        useQuadraticVoting: true,
        signer: wallet,
      });
    }
    if (!(await isTallied(pollId, maciAddress, provider, wallet))) {
      console.log('prove on chain');
      const result = await proveOnChain({
        pollId,
        proofDir: `${proofPath}/${partyId}_proofs`,
        signer: wallet,
        maciAddress,
      });

      console.log('prove on chain result: ', result);
    }
    const tally = await getTally(partyId);

    // finalize party
    if (Number(tally.totalSpentVoiceCredits.spent) > 0) {
      await finalizeParty(
        partyId,
        BigInt(tally.totalSpentVoiceCredits.spent),
        BigInt(tally.totalSpentVoiceCredits.salt),
        BigInt(tally.results.commitment),
        BigInt(tally.perVOSpentVoiceCredits.commitment),
        wallet,
      );
    }
    return { status: 'success', error: null };
  } catch (error) {
    return { status: 'failed', error: error.message };
  }
};