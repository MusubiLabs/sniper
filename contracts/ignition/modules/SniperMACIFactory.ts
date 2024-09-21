import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const deployedMACI = require("../../maci-deployed-contracts.json");
// load address and key
const poseidonT3ContractAddress = deployedMACI.optimism_sepolia.named.PoseidonT3.address;
const poseidonT4ContractAddress = deployedMACI.optimism_sepolia.named.PoseidonT4.address;
const poseidonT5ContractAddress = deployedMACI.optimism_sepolia.named.PoseidonT5.address;
const poseidonT6ContractAddress = deployedMACI.optimism_sepolia.named.PoseidonT6.address;
export default buildModule("SniperMACIFactory", (m) => {
    const poseidonT3ContractAt = m.contractAt("PoseidonT3", poseidonT3ContractAddress)
    const poseidonT4ContractAt = m.contractAt("PoseidonT4", poseidonT4ContractAddress)
    const poseidonT5ContractAt = m.contractAt("PoseidonT5", poseidonT5ContractAddress)
    const poseidonT6ContractAt = m.contractAt("PoseidonT6", poseidonT6ContractAddress)
    const sniperMACIFactory = m.contract("SniperMACIFactory", [], {
        libraries: {
            PoseidonT3: poseidonT3ContractAt,
            PoseidonT4: poseidonT4ContractAt,
            PoseidonT5: poseidonT5ContractAt,
            PoseidonT6: poseidonT6ContractAt,
        }
    });

    return { sniperMACIFactory };
});