import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";

export default buildModule("Sniper", (m) => {
    const zoneCompleteSchema = m.getParameter("zoneCompleteSchema", 0);
    const worldVerifierAddress = m.getParameter("worldVerifierAddress", zeroAddress);
    const spAddress = m.getParameter("spAddress", zeroAddress);
    const sniperCoinAddress = m.getParameter("sniperCoinAddress", zeroAddress);
    const spHookAddress = m.getParameter("spHookAddress", zeroAddress);
    const spHook = m.contractAt("SniperSPHook", spHookAddress, {});
    const sniper = m.contract("Sniper", [worldVerifierAddress, spAddress, sniperCoinAddress, zoneCompleteSchema]);

    m.call(spHook, "setWhitelist", [sniper, true]);
    return { sniper };
});