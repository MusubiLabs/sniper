
import { ethers, Signer } from "ethers";
import fs from "fs";
import { genProofs, mergeMessages, mergeSignups, proveOnChain, TallyData, verify, VerifyArgs } from "maci-cli";

// Define the ABI for the SniperPartyManager contract
const SNIPER_PARTY_MANAGER_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "partyId", "type": "uint256" },
            { "internalType": "uint256", "name": "_totalSpent", "type": "uint256" },
            { "internalType": "uint256", "name": "_totalSpentSalt", "type": "uint256" },
            { "internalType": "uint256", "name": "_newResultCommitment", "type": "uint256" },
            { "internalType": "uint256", "name": "_perVOSpentVoiceCreditsHash", "type": "uint256" }
        ],
        "name": "finalizeParty",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Initialize provider and signer (wallet)
const providerUrl = process.env.PROVIDER_URL;

// Initialize ethers provider and signer
const provider = new ethers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
interface SniperContractAddresses {
    SniperCoin: string
    WorldVerifier: string
    Sniper: string
    SniperPartyManager: string
    usdc: string
}

/**
 * Read a JSON file from disk
 * @param path - the path of the file
 * @returns the JSON object
 */
export const readJSONFile = async (path: string): Promise<Record<string, Record<string, string> | undefined>> => {
    const isExists = fs.existsSync(path);

    if (!isExists) {
        console.log(`File ${path} does not exist`);
    }

    return JSON.parse(await fs.promises.readFile(path).then((res) => res.toString())) as Record<
        string,
        Record<string, string> | undefined
    >;
};

export const verifyArgs = async (): Promise<Omit<VerifyArgs, "signer">> => {
    const tallyData = (await readJSONFile('./tally.json')) as unknown as TallyData;

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
    perVOSpentVoiceCreditsCommitment: bigint) => {
    try {
        const contractAddress = (await readJSONFile('../deployed-contracts.json')) as unknown as SniperContractAddresses; // Replace with your contract's address

        // Connect to the contract
        const partyManager = new ethers.Contract(contractAddress.SniperPartyManager, SNIPER_PARTY_MANAGER_ABI, wallet);
        // Call the finalizeParty method
        const tx = await partyManager.finalizeParty(
            partyId,
            totalSpent,
            totalSpentSalt,
            resultsCommitment,
            perVOSpentVoiceCreditsCommitment
        );

        console.log('Transaction sent, waiting for confirmation...');
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
    } catch (error) {
        console.error('Error finalizing party:', error);
    }
}

export const tallyVotes = async (
    partyId: bigint, pollId: bigint, maciAddress: string, signer: Signer) => {

    await mergeMessages({ pollId, maciAddress, signer });
    console.log('merging signups')
    await mergeSignups({ pollId, maciAddress, signer });
    console.log('gen proofs')
    await genProofs({
        outputDir: `./finalize/proofs/${partyId}_proofs`,
        tallyFile: `./finalize/tallys/${partyId}_tally.json`,
        tallyZkey: './zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey',
        processZkey: './zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey',
        pollId,
        processWitgen: './zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_cpp/ProcessMessages_10-2-1-2_test',
        processDatFile: './zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_cpp/ProcessMessages_10-2-1-2_test.dat',
        tallyWitgen: './zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_cpp/TallyVotes_10-1-2_test',
        tallyDatFile: './zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_cpp/TallyVotes_10-1-2_test.dat',
        coordinatorPrivKey: process.env.COORDINATOR_PRIVKEY,
        maciAddress,
        processWasm: './zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_js/ProcessMessages_10-2-1-2_test.wasm',
        tallyWasm: './zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_js/TallyVotes_10-1-2_test.wasm',
        useWasm: true,
        useQuadraticVoting: true,
        signer
    });
    console.log('prove on chain')
    await proveOnChain({ pollId, proofDir: `./finalize/proofs/${partyId}_proofs`, signer, maciAddress });
    console.log('verify')
    await verify({ ...(await verifyArgs()), pollId, maciAddress, signer });
    const tally = require(`../finalize/tallys/${partyId}_tally.json`);

    // finalize party
    await finalizeParty(
        partyId,
        BigInt(tally.totalSpentVoiceCredits.spent),
        BigInt(tally.totalSpentVoiceCredits.salt),
        BigInt(tally.results.commitment),
        BigInt(tally.perVOSpentVoiceCredits.commitment)
    );
};