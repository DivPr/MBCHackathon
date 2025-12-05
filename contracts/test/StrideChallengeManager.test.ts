import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { StrideChallengeManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("StrideChallengeManager", function () {
  let manager: StrideChallengeManager;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let charlie: HardhatEthersSigner;

  const STAKE_AMOUNT = ethers.parseEther("0.01");
  const DURATION = 86400; // 24 hours

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();

    const StrideChallengeManager = await ethers.getContractFactory(
      "StrideChallengeManager"
    );
    manager = await StrideChallengeManager.deploy();
    await manager.waitForDeployment();
  });

  describe("Challenge Creation", function () {
    it("should create a challenge with correct parameters", async function () {
      const tx = await manager
        .connect(alice)
        .createChallenge(STAKE_AMOUNT, DURATION, "5K Run", {
          value: STAKE_AMOUNT,
        });

      await expect(tx)
        .to.emit(manager, "ChallengeCreated")
        .withArgs(
          0,
          alice.address,
          STAKE_AMOUNT,
          (await time.latest()) + DURATION,
          "5K Run"
        );

      const challenge = await manager.getChallenge(0);
      expect(challenge.creator).to.equal(alice.address);
      expect(challenge.stakeAmount).to.equal(STAKE_AMOUNT);
      expect(challenge.description).to.equal("5K Run");
      expect(challenge.settled).to.be.false;
      expect(challenge.totalPool).to.equal(STAKE_AMOUNT);
    });

    it("should fail if stake amount is zero", async function () {
      await expect(
        manager.connect(alice).createChallenge(0, DURATION, "Test", { value: 0 })
      ).to.be.revertedWithCustomError(manager, "InvalidStakeAmount");
    });

    it("should fail if duration is zero", async function () {
      await expect(
        manager
          .connect(alice)
          .createChallenge(STAKE_AMOUNT, 0, "Test", { value: STAKE_AMOUNT })
      ).to.be.revertedWithCustomError(manager, "InvalidDuration");
    });

    it("should fail if incorrect ETH is sent", async function () {
      await expect(
        manager
          .connect(alice)
          .createChallenge(STAKE_AMOUNT, DURATION, "Test", {
            value: ethers.parseEther("0.005"),
          })
      ).to.be.revertedWithCustomError(manager, "IncorrectStakeAmount");
    });

    it("should increment challenge count", async function () {
      expect(await manager.challengeCount()).to.equal(0);

      await manager
        .connect(alice)
        .createChallenge(STAKE_AMOUNT, DURATION, "Challenge 1", {
          value: STAKE_AMOUNT,
        });
      expect(await manager.challengeCount()).to.equal(1);

      await manager
        .connect(bob)
        .createChallenge(STAKE_AMOUNT, DURATION, "Challenge 2", {
          value: STAKE_AMOUNT,
        });
      expect(await manager.challengeCount()).to.equal(2);
    });
  });

  describe("Joining Challenges", function () {
    beforeEach(async function () {
      await manager
        .connect(alice)
        .createChallenge(STAKE_AMOUNT, DURATION, "5K Run", {
          value: STAKE_AMOUNT,
        });
    });

    it("should allow joining a challenge", async function () {
      const tx = await manager.connect(bob).joinChallenge(0, {
        value: STAKE_AMOUNT,
      });

      await expect(tx)
        .to.emit(manager, "ParticipantJoined")
        .withArgs(0, bob.address);

      expect(await manager.hasJoined(0, bob.address)).to.be.true;
      
      const participants = await manager.getParticipants(0);
      expect(participants).to.include(bob.address);
    });

    it("should update total pool when joining", async function () {
      await manager.connect(bob).joinChallenge(0, { value: STAKE_AMOUNT });

      const challenge = await manager.getChallenge(0);
      expect(challenge.totalPool).to.equal(STAKE_AMOUNT * 2n);
    });

    it("should fail if challenge does not exist", async function () {
      await expect(
        manager.connect(bob).joinChallenge(999, { value: STAKE_AMOUNT })
      ).to.be.revertedWithCustomError(manager, "ChallengeNotFound");
    });

    it("should fail if already joined", async function () {
      await manager.connect(bob).joinChallenge(0, { value: STAKE_AMOUNT });

      await expect(
        manager.connect(bob).joinChallenge(0, { value: STAKE_AMOUNT })
      ).to.be.revertedWithCustomError(manager, "AlreadyJoined");
    });

    it("should fail if challenge has ended", async function () {
      await time.increase(DURATION + 1);

      await expect(
        manager.connect(bob).joinChallenge(0, { value: STAKE_AMOUNT })
      ).to.be.revertedWithCustomError(manager, "ChallengeEnded");
    });

    it("should fail with incorrect stake amount", async function () {
      await expect(
        manager.connect(bob).joinChallenge(0, {
          value: ethers.parseEther("0.005"),
        })
      ).to.be.revertedWithCustomError(manager, "IncorrectStakeAmount");
    });
  });

  describe("Marking Completion", function () {
    beforeEach(async function () {
      await manager
        .connect(alice)
        .createChallenge(STAKE_AMOUNT, DURATION, "5K Run", {
          value: STAKE_AMOUNT,
        });
      await manager.connect(bob).joinChallenge(0, { value: STAKE_AMOUNT });
    });

    it("should allow marking completion", async function () {
      const tx = await manager.connect(alice).markCompleted(0);

      await expect(tx)
        .to.emit(manager, "CompletionMarked")
        .withArgs(0, alice.address);

      expect(await manager.hasCompleted(0, alice.address)).to.be.true;
      
      const completers = await manager.getCompleters(0);
      expect(completers).to.include(alice.address);
    });

    it("should fail if not joined", async function () {
      await expect(
        manager.connect(charlie).markCompleted(0)
      ).to.be.revertedWithCustomError(manager, "NotJoined");
    });

    it("should fail if already completed", async function () {
      await manager.connect(alice).markCompleted(0);

      await expect(
        manager.connect(alice).markCompleted(0)
      ).to.be.revertedWithCustomError(manager, "AlreadyCompleted");
    });

    it("should fail if challenge has ended", async function () {
      await time.increase(DURATION + 1);

      await expect(
        manager.connect(alice).markCompleted(0)
      ).to.be.revertedWithCustomError(manager, "ChallengeEnded");
    });
  });

  describe("Settling Challenges", function () {
    beforeEach(async function () {
      await manager
        .connect(alice)
        .createChallenge(STAKE_AMOUNT, DURATION, "5K Run", {
          value: STAKE_AMOUNT,
        });
      await manager.connect(bob).joinChallenge(0, { value: STAKE_AMOUNT });
      await manager.connect(charlie).joinChallenge(0, { value: STAKE_AMOUNT });
    });

    it("should settle with multiple winners", async function () {
      await manager.connect(alice).markCompleted(0);
      await manager.connect(bob).markCompleted(0);
      // Charlie doesn't complete

      await time.increase(DURATION + 1);

      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);
      const bobBalanceBefore = await ethers.provider.getBalance(bob.address);

      const tx = await manager.connect(owner).settleChallenge(0);

      await expect(tx).to.emit(manager, "ChallengeSettled");

      const challenge = await manager.getChallenge(0);
      expect(challenge.settled).to.be.true;

      // Total pool is 3 * STAKE_AMOUNT, split between 2 winners
      const prizePerWinner = (STAKE_AMOUNT * 3n) / 2n;

      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
      const bobBalanceAfter = await ethers.provider.getBalance(bob.address);

      expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(prizePerWinner);
      expect(bobBalanceAfter - bobBalanceBefore).to.equal(prizePerWinner);
    });

    it("should settle with single winner taking all", async function () {
      await manager.connect(alice).markCompleted(0);

      await time.increase(DURATION + 1);

      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);

      await manager.connect(owner).settleChallenge(0);

      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);

      // Alice gets the entire pool (3 stakes)
      expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(STAKE_AMOUNT * 3n);
    });

    it("should refund everyone when no completers", async function () {
      await time.increase(DURATION + 1);

      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);
      const bobBalanceBefore = await ethers.provider.getBalance(bob.address);
      const charlieBalanceBefore = await ethers.provider.getBalance(charlie.address);

      await manager.connect(owner).settleChallenge(0);

      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
      const bobBalanceAfter = await ethers.provider.getBalance(bob.address);
      const charlieBalanceAfter = await ethers.provider.getBalance(charlie.address);

      // Everyone gets their stake back
      expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(STAKE_AMOUNT);
      expect(bobBalanceAfter - bobBalanceBefore).to.equal(STAKE_AMOUNT);
      expect(charlieBalanceAfter - charlieBalanceBefore).to.equal(STAKE_AMOUNT);
    });

    it("should fail if challenge not ended", async function () {
      await expect(
        manager.connect(owner).settleChallenge(0)
      ).to.be.revertedWithCustomError(manager, "ChallengeNotEnded");
    });

    it("should fail if already settled", async function () {
      await time.increase(DURATION + 1);
      await manager.connect(owner).settleChallenge(0);

      await expect(
        manager.connect(owner).settleChallenge(0)
      ).to.be.revertedWithCustomError(manager, "AlreadySettled");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await manager
        .connect(alice)
        .createChallenge(STAKE_AMOUNT, DURATION, "5K Run", {
          value: STAKE_AMOUNT,
        });
      await manager.connect(bob).joinChallenge(0, { value: STAKE_AMOUNT });
    });

    it("should return correct participants list", async function () {
      const participants = await manager.getParticipants(0);
      expect(participants.length).to.equal(2);
      expect(participants[0]).to.equal(alice.address);
      expect(participants[1]).to.equal(bob.address);
    });

    it("should return correct completers list", async function () {
      await manager.connect(alice).markCompleted(0);

      const completers = await manager.getCompleters(0);
      expect(completers.length).to.equal(1);
      expect(completers[0]).to.equal(alice.address);
    });

    it("should return correct hasJoined status", async function () {
      expect(await manager.hasJoined(0, alice.address)).to.be.true;
      expect(await manager.hasJoined(0, bob.address)).to.be.true;
      expect(await manager.hasJoined(0, charlie.address)).to.be.false;
    });

    it("should return correct hasCompleted status", async function () {
      expect(await manager.hasCompleted(0, alice.address)).to.be.false;
      
      await manager.connect(alice).markCompleted(0);
      
      expect(await manager.hasCompleted(0, alice.address)).to.be.true;
      expect(await manager.hasCompleted(0, bob.address)).to.be.false;
    });
  });
});

