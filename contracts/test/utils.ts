import { ethers, Signer } from 'ethers';
import { VerifyArgs } from 'maci-cli';
import { TallyData } from 'maci-contracts';
import fs from "fs";
import {
    genTreeCommitment as genTallyResultCommitment,
    IncrementalQuinTree,
    hash5,
    hash2,
} from 'maci-crypto'

export interface Tally {
    provider: string
    maci: string
    pollId: string
    newTallyCommitment: string
    results: {
      commitment: string
      tally: string[]
      salt: string
    }
    totalSpentVoiceCredits: {
      spent: string
      commitment: string
      salt: string
    }
    perVOSpentVoiceCredits: {
      commitment: string
      tally: string[]
      salt: string
    }
  }
// This has to match the MACI TREE_ARITY at:
// github.com/privacy-scaling-explorations/maci/blob/0c18913d4c84bfa9fbfd66dc017e338df9fdda96/contracts/contracts/MACI.sol#L31
export const MACI_TREE_ARITY = 2
// const provider: ethers.Provider = new ethers.JsonRpcProvider('https://opt-sepolia.g.alchemy.com/v2/Uye7DOCgmKHvFB8vOHGyC_sh4ysKjQNb', new ethers.Network('optimism_sepolia', 11155420), { staticNetwork: true })
// const provider: ethers.Provider = new ethers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/Uye7DOCgmKHvFB8vOHGyC_sh4ysKjQNb', new ethers.Network('base_sepolia', 84532), { staticNetwork: true })
// const provider: ethers.Provider = new ethers.JsonRpcProvider('https://arb-sepolia.g.alchemy.com/v2/Uye7DOCgmKHvFB8vOHGyC_sh4ysKjQNb', new ethers.Network('arbitrum_sepolia', 421614), { staticNetwork: true })
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/', new ethers.Network('optimism_sepolia', 11155420), { staticNetwork: true })
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider)
export const getSigner = async (): Promise<Signer> => {

    // const signer = await provider.getSigner(0)
    return wallet
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

export function getRecipientClaimData(
    recipientIndex: number,
    recipientTreeDepth: number,
    tally: Tally
): [bigint, bigint, readonly (readonly bigint[])[], bigint, bigint, bigint] {
    const maxRecipients = tally.perVOSpentVoiceCredits.tally.length
    if (recipientIndex >= maxRecipients) {
        throw new Error(`Invalid recipient index ${recipientIndex}.`)
    }

    // Create proof for total amount of spent voice credits
    const spent = tally.perVOSpentVoiceCredits.tally[recipientIndex]
    const spentSalt = tally.perVOSpentVoiceCredits.salt
    const spentTree = new IncrementalQuinTree(
        recipientTreeDepth,
        BigInt(0),
        MACI_TREE_ARITY,
        hash5
    )
    for (const leaf of tally.perVOSpentVoiceCredits.tally) {
        spentTree.insert(BigInt(leaf))
    }
    const spentProof = spentTree.genProof(recipientIndex)

    const resultsCommitment = genTallyResultCommitment(
        tally.results.tally.map((x) => BigInt(x)),
        BigInt(tally.results.salt),
        recipientTreeDepth
    )

    const spentVoiceCreditsCommitment = hash2([
        BigInt(tally.totalSpentVoiceCredits.spent),
        BigInt(tally.totalSpentVoiceCredits.salt),
    ])

    return [
        recipientIndex,
        spent,
        spentProof.pathElements.map((x) => x.map((y) => y.toString())),
        spentSalt,
        resultsCommitment,
        spentVoiceCreditsCommitment,
    ]
}