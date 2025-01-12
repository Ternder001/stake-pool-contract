import { ethers } from "hardhat";

async function main() {
  const initialOwner = "0x77158c23cc2d9dd3067a82e2067182c85fa3b1f6";
  const erc20Contract = await ethers.deployContract("ERC20Token", [
    initialOwner,
    "JARA",
    "JR",
  ]);

  await erc20Contract.waitForDeployment();

  console.log(`ERC20 Token contract deployed to ${erc20Contract.target}`);

  const stakePool = await ethers.deployContract("StakePool", [
    erc20Contract.target,
  ]);

  await stakePool.waitForDeployment();

  console.log(`Stake Pool contract deployed to ${stakePool.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat run scripts/deploy.ts --network sepolia
// ERC20 Token contract deployed to 0x386BE69B2b4a6cf04CF184e8253fB2E08cDA27f5
// npx hardhat verify --network sepolia 0x386BE69B2b4a6cf04CF184e8253fB2E08cDA27f5 0x77158c23cc2d9dd3067a82e2067182c85fa3b1f6 JARA JR

// StakePool contract deployed to 0x1E6456cD9edA5f2D461c7a5819Cd5EBE7FBF3b5E
// npx hardhat verify --network sepolia 0x1E6456cD9edA5f2D461c7a5819Cd5EBE7FBF3b5E 0x77158c23cc2d9dd3067a82e2067182c85fa3b1f6

// npx hardhat test
