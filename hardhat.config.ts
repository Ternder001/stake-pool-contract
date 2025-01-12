import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: ALCHEMY_API_KEY_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
};

export default config;

// npx hardhat run scripts/deploy.ts --network sepolia
//  npx hardhat verify --network sepolia <ADDRESS>

// npx hardhat test

// contracts/ChainBattles.sol:ChainBattles at 0x0E31545F3B5E3a5e077921f628baf72fcCaBF629
// for verification on the block explorer. Waiting for verification result...

// Successfully verified contract ChainBattles on the block explorer.
// https://sepolia.etherscan.io/address/0x0E31545F3B5E3a5e077921f628baf72fcCaBF629#code

// Successfully submitted source code for contract
// contracts/ChainBattles.sol:ChainBattles at 0x00F782f3660F0Ae78e818C7D961c814C7911C5c3
// for verification on the block explorer. Waiting for verification result...

// Successfully verified contract ChainBattles on the block explorer.
// https://sepolia.etherscan.io/address/0x00F782f3660F0Ae78e818C7D961c814C7911C5c3#code