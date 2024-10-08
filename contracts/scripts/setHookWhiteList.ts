import hre from "hardhat";

import deployed_addresses from "../ignition/deployments/chain-11155420/deployed_addresses.json";
async function main() {
    const [deployer] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const hookAddress = "SniperSPHook#SniperSPHook" in deployed_addresses ? deployed_addresses["SniperSPHook#SniperSPHook"] : process.env.SIGN_PROTOCOL_HOOK_ADDRESS
    const sphookAsOwner = await hre.viem.getContractAt(
        "SniperSPHook",
        hookAddress,
        { client: { wallet: deployer } }
    );

    const setWhitelistTx = await sphookAsOwner.write.setWhitelist([deployed_addresses["Sniper#Sniper"], true]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: setWhitelistTx });
    receipt.status === "success" ? console.log('setWhitelist Done:' + setWhitelistTx) : console.log('setWhitelist Failed')

}

main().catch(console.error);