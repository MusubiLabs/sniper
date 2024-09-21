import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SniperSPHook", (m) => {

    const spHook = m.contract("SniperSPHook", [], {});

    return { spHook };
});