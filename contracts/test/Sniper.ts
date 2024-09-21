import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { ignition, network } from "hardhat";
import { decodeEventLog, zeroAddress } from "viem";
import { DataLocationOnChain } from "@ethsign/sp-sdk";

describe("Sniper", function () {
  async function deploySniperFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const publicClient = await hre.viem.getPublicClient();

    const sp = await hre.viem.deployContract("MockSP", [], {});

    const worldId = await hre.viem.deployContract("MockWorldID", [], {});
    const mockSPAsOwner = await hre.viem.getContractAt(
      "MockSP",
      sp.address,
      { client: { wallet: owner } }
    );

    const sphook = await hre.viem.deployContract("SniperSPHook", [], {});

    const schemaTx = await mockSPAsOwner.write.register([{
      registrant: owner.account.address,
      dataLocation: DataLocationOnChain.ONCHAIN,
      revocable: true,
      maxValidFor: 0n,
      hook: sphook.address,
      timestamp: 0n,
      data: [
        { name: "zoneId", type: "uint256" },
        { name: "productivityScore", type: "uint256" },
        { name: "distractionScore", type: "uint256" },
        { name: "observations", type: "string" },
        { name: "assessment", type: "string" },
        { name: "feedback", type: "string" },
      ],
    }, "0x"])

    // For verify world action schema
    await mockSPAsOwner.write.register([{
      registrant: owner.account.address,
      dataLocation: DataLocationOnChain.ONCHAIN,
      revocable: true,
      maxValidFor: 0n,
      hook: zeroAddress,
      timestamp: 0n,
      data: [{ name: "name", type: "string" }],
    }, "0x"])

    const receipt = await publicClient.getTransactionReceipt({ hash: schemaTx });
    // Access the events from the receipt
    const events = receipt.logs;


    const decodedEvent = decodeEventLog({ abi: mockSPAsOwner.abi, data: receipt.logs[0].data, topics: receipt.logs[0].topics });
    const schemaID: bigint = decodedEvent.args.schemaId;

    const worldVerifier = await hre.viem.deployContract("WorldVerifier", [sp.address, worldId.address, 1, "123"], {});

    const rewardToken = await hre.viem.deployContract("SniperCoin", [sphook.address], {});

    const sniper = await hre.viem.deployContract("Sniper", [worldVerifier.address, sp.address, rewardToken.address, schemaID]);

    const sphookAsOwner = await hre.viem.getContractAt(
      "SniperSPHook",
      sphook.address,
      { client: { wallet: owner } }
    );
    await sphookAsOwner.write.setWhitelist([sniper.address, true]);

    await sphookAsOwner.write.setWorldVerifier([worldVerifier.address]);

    await worldVerifier.write.verifyWorldAction([0n, 0n, [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]]);

    return {
      sniper,
      worldVerifier,
      rewardToken,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right sniper", async function () {
      const { sniper } = await loadFixture(deploySniperFixture);

      expect(await sniper.read.schemaId()).to.eq(0n);
    });
  });

  describe("Create Sniper zone", function () {
    //   describe("Validations", function () {
    it("Should create zone correctly", async function () {
      const { sniper, publicClient, owner } = await loadFixture(deploySniperFixture);
      let tx = await sniper.write.createSniperZone(["test", 25n * 3600n]);

      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      // Access the events from the receipt
      const decodedEvent = decodeEventLog({ abi: sniper.abi, data: receipt.logs[0].data, topics: receipt.logs[0].topics });
      const { user, zoneId, zone } = decodedEvent.args;
      expect(user.toLowerCase()).to.eq(owner.account.address);
      expect(zoneId).to.eq(0n);
      expect(zone.ipfsHash).to.eq("test");
      expect(zone.duration).to.eq(25n * 3600n);
    });
    it("Should create zone failed without worldID verified", async function () {
      const { sniper, publicClient, otherAccount } = await loadFixture(deploySniperFixture);
      const sniperAsOther = await hre.viem.getContractAt(
        "Sniper",
        sniper.address,
        { client: { wallet: otherAccount } }
      );
      await expect(sniperAsOther.write.createSniperZone(["test", 25n * 3600n])).to.be.rejectedWith("User not verified by WorldID");

    });
  });

  describe("Complete Sniper zone", function () {
    const completeDetails = {
      productivityScore: 50n,
      distractionScore: 50n,
      observations: "test",
      assessment: "test",
      feedback: "test",
    }
    it("Should complete zone and trigger hook mint reward correctly", async function () {
      const { sniper, rewardToken, publicClient, worldVerifier, otherAccount } = await loadFixture(deploySniperFixture);
      const sniperAsOther = await hre.viem.getContractAt(
        "Sniper",
        sniper.address,
        { client: { wallet: otherAccount } }
      );
      const worldVerifierAsOther = await hre.viem.getContractAt(
        "WorldVerifier",
        worldVerifier.address,
        { client: { wallet: otherAccount } }
      );
      await worldVerifierAsOther.write.verifyWorldAction([0n, 1n, [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]]);
      await sniperAsOther.write.createSniperZone(["test", 25n * 60n]);
      await time.increase(60 * 60);
      let tx = await sniper.write.completeZone([otherAccount.account.address, 0n, completeDetails]);

      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      // Access the events from the receipt
      const decodedEvent = decodeEventLog({ abi: sniper.abi, data: receipt.logs[2].data, topics: receipt.logs[2].topics });
      const { user, zoneId, attestationId } = decodedEvent.args;
      const zone = await sniper.read.userZones([otherAccount.account.address, 0n]);
      expect(zone[3]).to.eq(true);
      expect(await rewardToken.read.balanceOf([otherAccount.account.address])).to.eq(500n * 10n ** 18n);
    });
    it("Should failed when Zone already completed", async function () {
      const { sniper, rewardToken, publicClient, worldVerifier, otherAccount } = await loadFixture(deploySniperFixture);
      const sniperAsOther = await hre.viem.getContractAt(
        "Sniper",
        sniper.address,
        { client: { wallet: otherAccount } }
      );
      const worldVerifierAsOther = await hre.viem.getContractAt(
        "WorldVerifier",
        worldVerifier.address,
        { client: { wallet: otherAccount } }
      );
      await worldVerifierAsOther.write.verifyWorldAction([0n, 1n, [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]]);
      await sniperAsOther.write.createSniperZone(["test", 25n * 60n]);
      await time.increase(60 * 60);
      await sniper.write.completeZone([otherAccount.account.address, 0n, completeDetails]);
      expect(sniper.write.completeZone([otherAccount.account.address, 0n, completeDetails])).to.be.rejectedWith("Zone already completed");
    });
    it("Should failed when Zone not yet ended", async function () {
      const { sniper, rewardToken, publicClient, worldVerifier, otherAccount } = await loadFixture(deploySniperFixture);
      const sniperAsOther = await hre.viem.getContractAt(
        "Sniper",
        sniper.address,
        { client: { wallet: otherAccount } }
      );
      const worldVerifierAsOther = await hre.viem.getContractAt(
        "WorldVerifier",
        worldVerifier.address,
        { client: { wallet: otherAccount } }
      );
      await worldVerifierAsOther.write.verifyWorldAction([0n, 1n, [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]]);
      await sniperAsOther.write.createSniperZone(["test", 25n * 60n]);
      await expect(sniper.write.completeZone([otherAccount.account.address, 0n, completeDetails])).to.be.rejectedWith("Zone not yet ended");
    });
  });

});
