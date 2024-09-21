import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-contract-sizer"
import dotenv from 'dotenv';
dotenv.config();
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 77,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    'op-sepolia': {
      url: 'https://opt-sepolia.g.alchemy.com/v2/Uye7DOCgmKHvFB8vOHGyC_sh4ysKjQNb',
      accounts: [
        process.env.PRIVATE_KEY as string,
      ]
    }
  }

};

export default config;
