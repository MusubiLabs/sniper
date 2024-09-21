import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";

export default buildModule("WorldVerifier", (m) => {
    const spAddress = m.getParameter("signProtocolAddress", zeroAddress);
    const worldIdAddress = m.getParameter("worldIdAddress", zeroAddress);
    const worldVerifierSchema = m.getParameter("worldVerifierSchema", 0);
    const worldAppID = m.getParameter("worldAppID", "");
    const worldVerifier = m.contract("WorldVerifier", [spAddress, worldIdAddress, worldVerifierSchema, worldAppID]);
    const spHookAddress = m.getParameter("spHookAddress", zeroAddress);
    const spHook = m.contractAt("SniperSPHook", spHookAddress, {});
    
    m.call(spHook, "setWorldVerifier", [worldVerifier]);
    return { worldVerifier };
});