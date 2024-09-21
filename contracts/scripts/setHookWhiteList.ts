import hre from "hardhat";

import deployed_addresses from "../ignition/deployments/chain-11155420/deployed_addresses.json";
async function main() {
    const [deployer] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const sphookAsOwner = await hre.viem.getContractAt(
        "SniperSPHook",
        deployed_addresses["SniperSPHook#SniperSPHook"],
        { client: { wallet: deployer } }
    );

    const setWhitelistTx = await sphookAsOwner.write.setWhitelist([deployed_addresses["Sniper#Sniper"], true]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: setWhitelistTx });
    receipt.status === "success" ? console.log('setWhitelist Done:'+setWhitelistTx) : console.log('setWhitelist Failed')
    const setWorldVerifierTx = await sphookAsOwner.write.setWorldVerifier([deployed_addresses["WorldVerifier#WorldVerifier"]]);
    const receipt2 = await publicClient.waitForTransactionReceipt({ hash: setWorldVerifierTx });
    receipt2.status === "success" ? console.log('setWorldVerifier Done:'+setWorldVerifierTx) : console.log('setWorldVerifier Failed')

}

main().catch(console.error);