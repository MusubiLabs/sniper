import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";

export default buildModule("SniperCoin", (m) => {
    const spHookAddress = m.getParameter("signProtocolHookAddress", zeroAddress);

    const sniperCoin = m.contract("SniperCoin", [spHookAddress], {});

    return { sniperCoin };
});