import {
    SignProtocolClient,
    SpMode,
    EvmChains,
    DataLocationOnChain,
} from '@ethsign/sp-sdk';
import { privateKeyToAccount } from "viem/accounts";
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.optimismSepolia,
    account: account, // optional
});

export const createWorldVerifierSchema = async () => {
    const verifySchema = await client.createSchema({
        name: "sniperWorldIDVerify",
        registrant: account.address,
        dataLocation: DataLocationOnChain.ONCHAIN,
        revocable: true,
        data: [
            { name: "root", type: "uint256" },
            { name: "nullifierHash", type: "uint256" },
            { name: "proof", type: "uint256[]" },
        ]
    })
    return verifySchema;
}

export const createCompleteSchema = async (hookAddress: `0x${string}`) => {
    const completeSchema = await client.createSchema({
        name: "zoneCompleted",
        registrant: account.address,
        dataLocation: DataLocationOnChain.ONCHAIN,
        revocable: true,
        hook: hookAddress,
        data: [
            { name: "zoneId", type: "uint256" },
            { name: "productivityScore", type: "uint256" },
            { name: "distractionScore", type: "uint256" },
            { name: "finalDuration", type: "uint256" },
            { name: "ipfsHash", type: "string" },
        ]
    })
    return completeSchema;
}