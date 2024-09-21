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
      forking: {
        url: "https://opt-sepolia.g.alchemy.com/v2/Uye7DOCgmKHvFB8vOHGyC_sh4ysKjQNb",
        blockNumber: 16695388,
      },
      accounts: [
        {privateKey:process.env.PRIVATE_KEY as string,balance: "100000000000000000000000"},

        {privateKey:process.env.PRIVATE_KEY2 as string,balance: "100000000000000000000000"}
      ]
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
