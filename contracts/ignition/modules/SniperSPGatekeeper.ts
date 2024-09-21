import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";

export default buildModule("SniperSPGatekeeper", (m) => {
    const spAddress = m.getParameter("spAddress", zeroAddress);
    const worldVerifierAddress = m.getParameter("worldVerifierAddress", zeroAddress);
    const worldVerifierSchemaID = m.getParameter("worldVerifierSchemaID", '0x0');
    const maciFactoryAddress = m.getParameter("maciFactoryAddress", zeroAddress);
    const sniperSPGatekeeper = m.contract("SniperSPGatekeeper", [spAddress, worldVerifierAddress, worldVerifierSchemaID], {});
    m.call(sniperSPGatekeeper, "setMACIFactory", [maciFactoryAddress]);
    return { sniperSPGatekeeper };
});