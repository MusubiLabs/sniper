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

    const setWorldVerifierTx = await sphookAsOwner.write.setWorldVerifier([deployed_addresses["WorldVerifier#WorldVerifier"]]);
    const receipt2 = await publicClient.waitForTransactionReceipt({ hash: setWorldVerifierTx });
    receipt2.status === "success" ? console.log('setWorldVerifier Done:' + setWorldVerifierTx) : console.log('setWorldVerifier Failed')

}

main().catch(console.error);