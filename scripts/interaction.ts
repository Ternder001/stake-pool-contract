import { ethers } from "hardhat";

const OWNER_ADDRESS = "0x77158c23cc2d9dd3067a82e2067182c85fa3b1f6";
const STAKE_POOL_ADDRESS = "0x1E6456cD9edA5f2D461c7a5819Cd5EBE7FBF3b5E";
const ERC20_TOKEN = "0x386BE69B2b4a6cf04CF184e8253fB2E08cDA27f5";

async function interact() {
  const stakePool = await ethers.getContractAt("StakePool", STAKE_POOL_ADDRESS);
  const erc20Token = await ethers.getContractAt("ERC20Token", ERC20_TOKEN);

  const stakeAmount = ethers.parseUnits("3", 18);

  console.log(`The Stake Amount to be staked is : ${stakeAmount}`);

  // approce the stakePool to spend the ERC20 tokens
  const approve = await erc20Token.approve(stakePool.target, stakeAmount);
  approve.wait();

  //stake the ERC20 tokens
  const stake = await stakePool.stake(stakeAmount);
  stake.wait();

  let sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await sleep(60000);

  console.log(`The ERC20 tokens are staked successfully`);

  //get the user stake
  const ownerStake = await stakePool.userStake(OWNER_ADDRESS);

  console.log(`The owner stake is : ${ownerStake}`);

  //   // get the total shares deposited
  const totalSharesDeposited = await stakePool.totalSharesDeposited();

  console.log(`The total shares deposited are : ${totalSharesDeposited}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
interact().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat run scripts/interaction.ts --network sepolia
