import hre from "hardhat";
import sniperModule from "../ignition/modules/sniper";
import worldVerifierModule from "../ignition/modules/WorldVerifier";
import sniperCoinModule from "../ignition/modules/SniperCoin";
import sphookModule from "../ignition/modules/SniperSPhook"; 
import { createCompleteSchema } from "./utils";

async function main() {
    const [deployer] = await hre.viem.getWalletClients();
    console.log('deployer: ', deployer.account.address);
    let spHook, completeSchema, sniperCoin;
    if (process.env.ZONE_COMPLETE_SCHEMA === undefined) {
        const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
        const client = new SignProtocolClient(SpMode.OnChain, {
            chain: EvmChains.optimismSepolia,
            account: account, // optional
        });
        spHook = await hre.ignition.deploy(sphookModule, {});
        spHook = spHook.spHook;
        completeSchema = await createCompleteSchema(spHook.address)
        console.log('completeSchema:', completeSchema.schemaId);
        console.log(`spHook deployed to: ${await spHook.address}`);

    }
    if (process.env.SNIPER_COIN_ADDRESS) {
        sniperCoin = { address: process.env.SNIPER_COIN_ADDRESS }
    } else {
        sniperCoin = await hre.ignition.deploy(sniperCoinModule, {
            parameters: {
                SniperCoin: {
                    signProtocolHookAddress: spHook ? spHook.address : process.env.SIGN_PROTOCOL_HOOK_ADDRESS as string,
                },
            },
        });
        sniperCoin = sniperCoin.sniperCoin;
        console.log(`sniperCoin deployed to: ${await sniperCoin.address}`);
    }
    const { worldVerifier } = await hre.ignition.deploy(worldVerifierModule, {
        parameters: {
            WorldVerifier: {
                signProtocolAddress: process.env.SIGN_PROTOCOL_ADDRESS as string,
                worldIdAddress: process.env.WORLD_ID_ADDRESS as string,
                worldVerifierSchema: process.env.WORLD_VERIFIER_SCHEMA as string,
                worldAppID: process.env.WORLD_APP_ID as string,
            },
        },
    });

    console.log(`worldVerifier deployed to: ${await worldVerifier.address}`);
    const { sniper } = await hre.ignition.deploy(sniperModule, {
        parameters: {
            Sniper: {
                zoneCompleteSchema: process.env.ZONE_COMPLETE_SCHEMA ? process.env.ZONE_COMPLETE_SCHEMA as string : completeSchema?.schemaId as string,
                worldVerifierAddress: worldVerifier.address,
                spAddress: process.env.SIGN_PROTOCOL_ADDRESS as string,
                sniperCoinAddress: sniperCoin.address,
            },
        },
    });

    console.log(`Sniper deployed to: ${await sniper.address}`);
}

main().catch(console.error);