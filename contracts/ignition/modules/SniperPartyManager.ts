import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { genEmptyBallotRoots } from "maci-contracts";
import { PubKey } from "maci-domainobjs";
import { zeroAddress } from "viem";


const deployedMACI = require("../../maci-deployed-contracts.json");
// load address and key
const coordinatorPubKey = process.env.COORDINATOR_PUBKEY as string;
const verifierAddress = deployedMACI.optimism_sepolia.named.Verifier.address
const pollFactory = deployedMACI.optimism_sepolia.named.PollFactory.address
const messageProcessorFactory = deployedMACI.optimism_sepolia.named.MessageProcessorFactory.address
const tallyFactory = deployedMACI.optimism_sepolia.named.TallyFactory.address
const vkRegistryAddress = deployedMACI.optimism_sepolia.named.VkRegistry.address
export default buildModule("SniperPartyManager", (m) => {
    const sniperFundsCalc = m.library("SniperFundsCalc");
    
    const worldVerifierAddress = m.getParameter("worldVerifierAddress", zeroAddress);
    const usdcAddress = m.getParameter("usdcAddress", zeroAddress)
    const sniperAddress = m.getParameter("sniperAddress", zeroAddress)
    const maciFactoryAddress = m.getParameter("maciFactoryAddress", zeroAddress)
    const sniperSPGatekeeperAddress = m.getParameter("sniperSPGatekeeperAddress", zeroAddress)
    const sniper = m.contractAt("Sniper", sniperAddress, {});

    const sniperPartyManager = m.contract("SniperPartyManager", [
        usdcAddress,
        sniperAddress,
        worldVerifierAddress,
        [
            maciFactoryAddress,
            pollFactory,
            messageProcessorFactory,
            tallyFactory,
            sniperSPGatekeeperAddress,
            10n,
            genEmptyBallotRoots(10)
        ],
        [
            PubKey.deserialize(coordinatorPubKey).asContractParam(),
            [
                1n,
                1n,
                2n,
                2n,
            ],
            verifierAddress,
            vkRegistryAddress
        ]
    ], {
        libraries: {
            SniperFundsCalc: sniperFundsCalc
        }
    });

    m.call(sniper, "setPartyManager", [sniperPartyManager]);
    return { sniperPartyManager };
});