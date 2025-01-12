import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("StakePool", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployStakePool() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, addr1] = await ethers.getSigners();

    const tokenName = "JARA";
    const tokenSymbol = "JR";

    const ERC20 = await ethers.getContractFactory("ERC20Token");
    const erc20 = await ERC20.deploy(owner.address, tokenName, tokenSymbol);

    const StakePool = await ethers.getContractFactory("StakePool");

    const stakePool = await StakePool.deploy(await erc20.getAddress());

    console.log(`ERC20 contract deployed to ${await erc20.getAddress()}`);

    console.log(
      `StakePool contract deployed to ${await stakePool.getAddress()}`
    );

    return { owner, otherAccount, addr1, erc20, stakePool };
  }

  describe("Deployment", function () {
    it("Should be able to deploy the ERC20 contract", async () => {
      const { erc20 } = await loadFixture(deployStakePool);
      expect(erc20.target).to.not.equal(0);
    });

    it("Should be able to deploy the stakePool contract", async () => {
      const { stakePool } = await loadFixture(deployStakePool);
      expect(stakePool.target).to.not.equal(0);
    });

    it("Should be able to deploy the ERC20 contract with the right owner", async () => {
      const { owner, erc20 } = await loadFixture(deployStakePool);
      expect(await erc20.owner()).to.equal(owner.address);
    });
  });

  describe("Stake", function () {
    it("Should be able to stake ERC20 tokens", async () => {
      const { owner, otherAccount, erc20, stakePool } = await loadFixture(
        deployStakePool
      );

      const stakeAmount = ethers.parseUnits("3", 18);

      await erc20.transfer(otherAccount.address, stakeAmount);

      await erc20.connect(otherAccount).approve(stakePool.target, stakeAmount);

      await stakePool.connect(otherAccount).stake(stakeAmount);

      expect(await stakePool.totalSharesDeposited()).to.equal(stakeAmount);
    });

    it("Should be able to stake ERC20 tokens and get shares", async () => {
      const { owner, otherAccount, erc20, stakePool } = await loadFixture(
        deployStakePool
      );

      const stakeAmount = ethers.parseUnits("3", 18);

      await erc20.transfer(otherAccount.address, stakeAmount);

      await erc20.connect(otherAccount).approve(stakePool.target, stakeAmount);

      await stakePool.connect(otherAccount).stake(stakeAmount);

      const shares = await stakePool.userStake(otherAccount.address);

      expect(shares[0]).to.equal(stakeAmount);
    });

    it("should not be able to stake more than the balance", async () => {
      const { owner, otherAccount, erc20, stakePool } = await loadFixture(
        deployStakePool
      );

      const transferAmount = ethers.parseUnits("3", 18);
      const stakeAmount = ethers.parseUnits("4", 18);

      await erc20.transfer(otherAccount.address, transferAmount);

      await erc20.connect(otherAccount).approve(stakePool.target, stakeAmount);

      expect(
        stakePool.connect(otherAccount).stake(stakeAmount)
      ).to.be.revertedWithCustomError(stakePool, "INSUFFICIENT_FUNDS");
    });
  });
});
