import hre from "hardhat";
import sniperModule from "../ignition/modules/Sniper";
import worldVerifierModule from "../ignition/modules/WorldVerifier";
import sniperCoinModule from "../ignition/modules/SniperCoin";
import sphookModule from "../ignition/modules/SniperSPHook";
import sniperPartyManagerModule from "../ignition/modules/SniperPartyManager"
import sniperSPGatekeeperModule from "../ignition/modules/SniperSPGatekeeper"
import sniperMACIFactoryModule from "../ignition/modules/SniperMACIFactory";
import { createCompleteSchema, createWorldVerifierSchema } from "./utils";

async function main() {

    const publicClient = await hre.viem.getPublicClient();
    const [deployer] = await hre.viem.getWalletClients();
    const initBal = await publicClient.getBalance({ address: deployer.account.address })
    console.log('deployer: ', deployer.account.address);
    let spHook, completeSchema, sniperCoin, worldVerifier;
    if (process.env.ZONE_COMPLETE_SCHEMA === undefined) {
        spHook = await hre.ignition.deploy(sphookModule, {});
        spHook = spHook.spHook;
        completeSchema = await createCompleteSchema(spHook.address)
        console.log('completeSchema:', completeSchema.schemaId);
        console.log(`spHook deployed to: ${await spHook.address}`);

    } else {
        spHook = await hre.viem.getContractAt("SniperSPHook", process.env.SIGN_PROTOCOL_HOOK_ADDRESS as string, { client: { wallet: deployer } });
    }
    if (process.env.SNIPER_POINT_ADDRESS) {
        sniperCoin = { address: process.env.SNIPER_POINT_ADDRESS }
    } else {
        sniperCoin = await hre.ignition.deploy(sniperCoinModule, {
            parameters: {
                SniperCoin: {
                    signProtocolHookAddress: spHook.address,
                },
            },
        });
        sniperCoin = sniperCoin.sniperCoin;
        console.log(`sniperCoin deployed to: ${await sniperCoin.address}`);
    }
    if (process.env.SNIPER_WORLD_VERIFIER_ADDRESS) {
        worldVerifier = { address: process.env.SNIPER_WORLD_VERIFIER_ADDRESS }
    } else {
        let worldSchema
        if (!process.env.WORLD_VERIFIER_SCHEMA) {
            worldSchema = await createWorldVerifierSchema()
        }
        worldVerifier = await hre.ignition.deploy(worldVerifierModule, {
            parameters: {
                WorldVerifier: {
                    signProtocolAddress: process.env.SIGN_PROTOCOL_ADDRESS as string,
                    worldIdAddress: process.env.WORLD_ID_ADDRESS as string,
                    worldVerifierSchema: worldSchema ? worldSchema : process.env.WORLD_VERIFIER_SCHEMA as string,
                    worldAppID: process.env.WORLD_APP_ID as string,
                    spHookAddress: spHook.address,
                },
            },
        });
        worldVerifier = worldVerifier.worldVerifier;
    }


    console.log(`worldVerifier deployed to: ${await worldVerifier.address}`);
    const { sniper } = await hre.ignition.deploy(sniperModule, {
        parameters: {
            Sniper: {
                sessionCompleteSchema: process.env.ZONE_COMPLETE_SCHEMA ? process.env.ZONE_COMPLETE_SCHEMA as string : completeSchema?.schemaId as string,
                worldVerifierAddress: worldVerifier.address,
                spAddress: process.env.SIGN_PROTOCOL_ADDRESS as string,
                sniperCoinAddress: sniperCoin.address,
                spHookAddress: spHook.address,
            },
        },
    });

    console.log(`Sniper deployed to: ${await sniper.address}`);
    const { sniperMACIFactory } = await hre.ignition.deploy(sniperMACIFactoryModule, {});
    const { sniperSPGatekeeper } = await hre.ignition.deploy(sniperSPGatekeeperModule, {
        parameters: {
            SniperSPGatekeeper: {
                spAddress: process.env.SIGN_PROTOCOL_ADDRESS as string,
                worldVerifierAddress: worldVerifier.address,
                worldVerifierSchemaID: process.env.WORLD_VERIFIER_SCHEMA as string,
                maciFactoryAddress: sniperMACIFactory.address
            },
        },
    });
    console.log(`SniperSPGatekeeper deployed to: ${await sniperSPGatekeeper.address}`);

    const { sniperPartyManager } = await hre.ignition.deploy(sniperPartyManagerModule, {
        parameters: {
            SniperPartyManager: {
                worldVerifierAddress: worldVerifier.address,
                usdcAddress: process.env.USDC_ADDRESS as string,
                sniperAddress: sniper.address,
                maciFactoryAddress: sniperMACIFactory.address,
                sniperSPGatekeeperAddress: sniperSPGatekeeper.address
            },
        },
    });
    console.log(`SniperPartyManager deployed to: ${await sniperPartyManager.address}`);
    spHook.read.worldVerifier().then((res) => console.log('worldVerifier:', res));
    spHook.read.whitelist([sniper.address]).then((res) => console.log('whitelist:', res));
    sniperSPGatekeeper.read.maciFactory().then((res) => console.log('maciFactory:', res));
    sniper.read.partyManager().then((res) => console.log('sniperPartyManager:', res));
    publicClient.getBalance({ address: deployer.account.address }).then((res) => console.log('deployer balance:', res - initBal));
}

main().catch(console.error);