import { ethers } from "hardhat";

const OWNER_ADDRESS = "0x77158c23cc2d9dd3067a82e2067182c85fa3b1f6";
const STAKE_POOL_ADDRESS = "0x1E6456cD9edA5f2D461c7a5819Cd5EBE7FBF3b5E";

async function interact() {
  const stakePool = await ethers.getContractAt(
    "IStakePool",
    STAKE_POOL_ADDRESS
  );



  //get the user stake
  const ownerStake = await stakePool.userStake(OWNER_ADDRESS);

  console.log(`The owner stake is : ${ownerStake}`);



  // get user rewards
  const ownerRewards = await stakePool.getUnpaid(OWNER_ADDRESS);

  console.log(`The owner rewards are : ${ownerRewards}`);



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
interact().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat run scripts/interaction.ts --network sepolia
