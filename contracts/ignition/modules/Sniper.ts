import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";

export default buildModule("Sniper", (m) => {
    const zoneCompleteSchema = m.getParameter("zoneCompleteSchema", 0);
    const worldVerifierAddress = m.getParameter("worldVerifierAddress", zeroAddress);
    const spAddress = m.getParameter("spAddress", zeroAddress);
    const sniperCoinAddress = m.getParameter("sniperCoinAddress", zeroAddress);

    const sniper = m.contract("Sniper", [worldVerifierAddress, spAddress, sniperCoinAddress, zoneCompleteSchema]);


    return { sniper };
});