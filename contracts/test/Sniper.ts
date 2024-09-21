import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import hre from "hardhat";
import { decodeEventLog, encodeAbiParameters, zeroAddress } from "viem";
import { genEmptyBallotRoots } from "maci-contracts";
import { PrivKey, PubKey } from "maci-domainobjs";
import { genKeypair, genRandomSalt } from "maci-crypto";
import { checkVerifyingKeys, deployPoll, deployVkRegistryContract, genProofs, getPoll, isRegisteredUser, mergeMessages, mergeSignups, proveOnChain, publish, setVerifyingKeys, signup, timeTravel, verify } from "maci-cli";
import { DataLocationOnChain } from "@ethsign/sp-sdk";
import { getRecipientClaimData, getSigner, verifyArgs } from "./utils";
import { expect } from "chai";

const deployedMACI = require("../maci-deployed-contracts.json");

const coordinatorPubkey = process.env.COORDINATOR_PUBKEY as string;

const worldVerifierSchemaID = process.env.WORLD_VERIFIER_SCHEMA;

const verifier = deployedMACI.optimism_sepolia.named.Verifier.address
const pollFactory = deployedMACI.optimism_sepolia.named.PollFactory.address
const messageProcessorFactory = deployedMACI.optimism_sepolia.named.MessageProcessorFactory.address
const tallyFactory = deployedMACI.optimism_sepolia.named.TallyFactory.address
const vkRegistry = deployedMACI.optimism_sepolia.named.VkRegistry.address
const unserializedKey = PubKey.deserialize(coordinatorPubkey);
const poseidonT3ContractAddress = deployedMACI.optimism_sepolia.named.PoseidonT3.address;
const poseidonT4ContractAddress = deployedMACI.optimism_sepolia.named.PoseidonT4.address;
const poseidonT5ContractAddress = deployedMACI.optimism_sepolia.named.PoseidonT5.address;
const poseidonT6ContractAddress = deployedMACI.optimism_sepolia.named.PoseidonT6.address;
let completeZoneSchemaID: string;
const completeDetails = {
  productivityScore: 5000n,
  distractionScore: 5n,
  finalDuration: 25n * 60n,
  ipfsHash: "bafkreicj2q3emv3qzn73r6junvfysb7ua5hyt2jctx3rumx3fhnj3nki3u",
}

describe("Sniper", function () {
  async function deploySniperFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const publicClient = await hre.viem.getPublicClient();
    const testClient = await hre.viem.getTestClient();
    const sp = await hre.viem.getContractAt(
      "MockSP",
      process.env.SIGN_PROTOCOL_ADDRESS
    );
    const worldId = await hre.viem.deployContract("MockWorldID", [], {});
    const mockUSDC = await hre.viem.deployContract("MockUSDC", [owner.account.address], {});
    const sphook = await hre.viem.deployContract("SniperSPHook", [], {});
    const calcLib = await hre.viem.deployContract("SniperFundsCalc", [], {});
    const MACIFactory = await hre.viem.deployContract("SniperMACIFactory", [], {
      libraries: {
        PoseidonT3: poseidonT3ContractAddress,
        PoseidonT4: poseidonT4ContractAddress,
        PoseidonT5: poseidonT5ContractAddress,
        PoseidonT6: poseidonT6ContractAddress,
      }
    });

    const schemaTx = await sp.write.register([{
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
        { name: "finalDuration", type: "uint256" },
        { name: "ipfsHash", type: "string" },
      ],
    }, "0x"])

    const receipt = await publicClient.getTransactionReceipt({ hash: schemaTx });
    // Access the events from the receipt
    const decodedEvent = decodeEventLog({ abi: sp.abi, data: receipt.logs[0].data, topics: receipt.logs[0].topics });
    completeZoneSchemaID = decodedEvent.args.schemaId;

    const worldVerifier = await hre.viem.deployContract("WorldVerifier", [sp.address, worldId.address, worldVerifierSchemaID, "123"], {});

    const rewardToken = await hre.viem.deployContract("SniperCoin", [sphook.address], {});

    const sniperSPGatekeeper = await hre.viem.deployContract("SniperSPGatekeeper", [sp.address, worldVerifier.address, worldVerifierSchemaID], {});

    const sniper = await hre.viem.deployContract("Sniper", [worldVerifier.address, sp.address, rewardToken.address, completeZoneSchemaID]);

    const sniperPartyManager = await hre.viem.deployContract("SniperPartyManager", [
      mockUSDC.address,
      sniper.address,
      worldVerifier.address,
      [
        MACIFactory.address,
        pollFactory,
        messageProcessorFactory,
        tallyFactory,
        sniperSPGatekeeper.address,
        10n,
        genEmptyBallotRoots(10)
      ],
      [
        unserializedKey.asContractParam(),
        [
          1n,
          1n,
          2n,
          2n,
        ],
        verifier,
        vkRegistry
      ]
    ], {
      libraries: {
        SniperFundsCalc: calcLib.address
      }
    });

    await sniper.write.setPartyManager([sniperPartyManager.address]);
    const sphookAsOwner = await hre.viem.getContractAt(
      "SniperSPHook",
      sphook.address,
      { client: { wallet: owner } }
    );
    await sniperSPGatekeeper.write.setPartyManager([sniperPartyManager.address]);
    await sphookAsOwner.write.setWhitelist([sniper.address, true]);

    await sphookAsOwner.write.setWorldVerifier([worldVerifier.address]);

    const ownerVerifyTx = await worldVerifier.write.verifyWorldAction([0n, 0n, [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]]);
    const ownerVerifyTxReceipt = await publicClient.getTransactionReceipt({ hash: ownerVerifyTx });
    const ownerVerifyDecodedEvent = decodeEventLog({ abi: sp.abi, data: ownerVerifyTxReceipt.logs[1].data, topics: ownerVerifyTxReceipt.logs[1].topics });
    const ownerVerifyAttestationId = ownerVerifyDecodedEvent.args.attestationId;

    return {
      sp,
      sniper,
      sniperPartyManager,
      worldVerifier,
      rewardToken,
      mockUSDC,
      owner,
      otherAccount,
      publicClient,
      ownerVerifyAttestationId,
      testClient
    };
  }

  describe("Deployment", function () {
    it("Should set the right sniper", async function () {
      const { sniper } = await loadFixture(deploySniperFixture);

      expect(await sniper.read.schemaId()).to.eq(completeZoneSchemaID);
    });
  });

  describe("Create Sniper zone", function () {
    it("Should create zone correctly", async function () {
      const { sniper, publicClient, owner } = await loadFixture(deploySniperFixture);
      let tx = await sniper.write.createSniperZone([25n * 3600n, BigInt(await time.latest()), "bafkreicj2q3emv3qzn73r6junvfysb7ua5hyt2jctx3rumx3fhnj3nki3u",]);

      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      // Access the events from the receipt
      const decodedEvent = decodeEventLog({ abi: sniper.abi, data: receipt.logs[0].data, topics: receipt.logs[0].topics });
      const { user, zoneId, zone } = decodedEvent.args;
      expect(user.toLowerCase()).to.eq(owner.account.address);
      expect(zoneId).to.eq(0n);
      expect(zone.ipfsHash).to.eq("bafkreicj2q3emv3qzn73r6junvfysb7ua5hyt2jctx3rumx3fhnj3nki3u");
      expect(zone.duration).to.eq(25n * 3600n);
    });
    it("Should create zone failed without worldID verified", async function () {
      const { sniper, publicClient, otherAccount } = await loadFixture(deploySniperFixture);
      const sniperAsOther = await hre.viem.getContractAt(
        "Sniper",
        sniper.address,
        { client: { wallet: otherAccount } }
      );
      await expect(sniperAsOther.write.createSniperZone([25n * 3600n, BigInt(await time.latest()), "bafkreicj2q3emv3qzn73r6junvfysb7ua5hyt2jctx3rumx3fhnj3nki3u",])).to.be.rejectedWith("UnverifiedUser");

    });
  });

  describe("Complete Sniper zone", function () {

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
      await sniperAsOther.write.createSniperZone([25n * 60n, BigInt(await time.latest()), "bafkreicj2q3emv3qzn73r6junvfysb7ua5hyt2jctx3rumx3fhnj3nki3u"]);
      await time.increase(60 * 60);
      let tx = await sniper.write.completeZone([otherAccount.account.address, 0n, completeDetails]);

      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      // Access the events from the receipt
      const decodedEvent = decodeEventLog({ abi: sniper.abi, data: receipt.logs[2].data, topics: receipt.logs[2].topics });
      const { user, zoneId, attestationId } = decodedEvent.args;
      const zone = await sniper.read.userZones([otherAccount.account.address, 0n]);
      expect(zone[3]).to.eq(true);
      expect(await rewardToken.read.balanceOf([otherAccount.account.address])).to.eq(475n * 10n ** 18n);
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
      await sniperAsOther.write.createSniperZone([25n * 60n, BigInt(await time.latest()), "bafkreicj2q3emv3qzn73r6junvfysb7ua5hyt2jctx3rumx3fhnj3nki3u"]);
      await time.increase(60 * 60);
      await sniper.write.completeZone([otherAccount.account.address, 0n, completeDetails]);
      expect(sniper.write.completeZone([otherAccount.account.address, 0n, completeDetails])).to.be.rejectedWith("Zone already completed");
    });
  });
  describe("Party", function () {

    it("Should create a party", async function () {
      const { sniperPartyManager, publicClient, otherAccount } = await loadFixture(deploySniperFixture);
      const partyEndTime = BigInt(await time.latest() + 3600); // 1 hour from now
      const voteEndTime = partyEndTime + 1800n; // 2 hours from now
      const ipfsHash = "QmSomeIpfsHash";

      await sniperPartyManager.write.createParty([partyEndTime, voteEndTime, ipfsHash])


      const party = await sniperPartyManager.read.activeParties([0n]);
      expect(party[3]).to.equal(partyEndTime);
      expect(party[4]).to.equal(ipfsHash);
    });

    it("Should join a party and create a sniper zone", async function () {
      const { sniper, sniperPartyManager, publicClient, owner } = await loadFixture(deploySniperFixture);
      const partyEndTime = BigInt(await time.latest() + 3600); // 1 hour from now
      const voteEndTime = partyEndTime + 1800n; // 2 hours from now
      const ipfsHash = "QmSomeIpfsHash";

      await sniperPartyManager.write.createParty([partyEndTime, voteEndTime, ipfsHash])

      await sniperPartyManager.write.joinParty([0n]);

      const party = await sniperPartyManager.read.activeParties([0n]);
      expect(party[5]).to.equal(1n);

      const zone = await sniper.read.userZones([owner.account.address, 0n]);
      expect(zone[0]).to.equal(ipfsHash);
      expect(zone[1]).to.equal(BigInt(await time.latest()));
      expect(zone[2]).to.equal(partyEndTime - BigInt(await time.latest()));
      expect(zone[3]).to.equal(false);
      expect(zone[5]).to.equal(1);
    });

    it("Should sponsor a party and get party token", async function () {
      const { sniperPartyManager, owner, mockUSDC } = await loadFixture(deploySniperFixture);
      const partyEndTime = BigInt(await time.latest() + 3600); // 1 hour from now
      const voteEndTime = partyEndTime + 1800n; // 2 hours from now
      const ipfsHash = "QmSomeIpfsHash";

      const usdcAmount = 1000n * 10n ** 6n;
      await mockUSDC.write.approve([sniperPartyManager.address, usdcAmount]);

      await sniperPartyManager.write.createParty([partyEndTime, voteEndTime, ipfsHash])
      await sniperPartyManager.write.sponsorParty([0n, usdcAmount]);

      const party = await sniperPartyManager.read.activeParties([0n]);
      const partyToken = await hre.viem.getContractAt(
        "PartyToken",
        party[2]
      );
      const partyPool = await sniperPartyManager.read.partyPool([0n]);
      expect(partyPool).to.equal(usdcAmount);

      const mockUSDCPartyBalance = await mockUSDC.read.balanceOf([sniperPartyManager.address]);
      const mockUSDCBalance = await mockUSDC.read.balanceOf([owner.account.address]);
      expect(mockUSDCBalance).to.equal(1000000n * 10n ** 6n - usdcAmount);
      expect(mockUSDCPartyBalance).to.equal(usdcAmount);

      const partyTokenBalance = await partyToken.read.balanceOf([owner.account.address]);
      expect(partyTokenBalance).to.equal(usdcAmount);
    });

    it("Should claim funds", async function () {
      const { sniper, sniperPartyManager, worldVerifier, owner, mockUSDC, otherAccount, ownerVerifyAttestationId, publicClient, testClient } = await loadFixture(deploySniperFixture);
      const partyEndTime = BigInt(await time.latest() + 3600); // 1 hour from now
      const voteEndTime = partyEndTime + 1800n; // 2 hours from now
      const signer = await getSigner();
      const keypair = genKeypair()
      const pubKey = new PubKey(keypair.pubKey)
      const privKey = new PrivKey(keypair.privKey)
      const sniperPartyManagerAsOther = await hre.viem.getContractAt(
        "SniperPartyManager",
        sniperPartyManager.address,
        { client: { wallet: otherAccount } }
      );
      const worldVerifierAsOther = await hre.viem.getContractAt(
        "WorldVerifier",
        worldVerifier.address,
        { client: { wallet: otherAccount } }
      );
      console.log(await time.latest())
      const ipfsHash = "QmSomeIpfsHash";

      const usdcAmount = 1000n * 10n ** 6n;
      await mockUSDC.write.approve([sniperPartyManager.address, usdcAmount]);
      // create party and sponsor
      await sniperPartyManager.write.createParty([partyEndTime, voteEndTime, ipfsHash])


      await sniperPartyManager.write.sponsorParty([0n, usdcAmount]);
      // other user join party

      await worldVerifierAsOther.write.verifyWorldAction([0n, 1n, [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]]);
      await sniperPartyManagerAsOther.write.joinParty([0n]);

      // user complete zone
      await sniper.write.completeZone([otherAccount.account.address, 0n, completeDetails]);

      // vote for party

      const party = await sniperPartyManager.read.activeParties([0n]);
      console.log(party)
      const maci = await hre.viem.getContractAt(
        "MACI",
        party[0]
      );
      // sign up
      let poll;
      const network = await signer.provider?.getNetwork();
      console.log(await maci.read.nextPollId())
      console.log(network?.name, network?.chainId, vkRegistry, coordinatorPubkey)

      poll = await getPoll({ maciAddress: maci.address, signer });
      console.log(poll)
      const registeredUser = await signup({
        maciAddress: maci.address, maciPubKey: pubKey.serialize(), signer: signer, sgDataArg: encodeAbiParameters(
          [
            { name: 'attestationId', type: 'uint64' },
            { name: 'partyId', type: 'uint256' }
          ],
          [ownerVerifyAttestationId, 0n]
        )
      })

      // console.log(latestBlock?.number)
      // get registered user
      // const registeredUser = await isRegisteredUser({ maciAddress: maci.address, maciPubKey: pubKey.serialize(), signer: signer, startBlock: latestBlock?.number })
      console.log(registeredUser)
      // vote
      await publish({
        pubkey: pubKey.serialize(),
        stateIndex: BigInt(registeredUser.stateIndex as string),
        voteOptionIndex: 0n,
        nonce: 1n,
        pollId: BigInt(poll.id),
        newVoteWeight: BigInt(Math.floor(Math.sqrt(Number(registeredUser.voiceCredits)))),
        maciAddress: maci.address,
        salt: genRandomSalt(),
        privateKey: privKey.serialize(),
        signer,
      });

      // time increase
      // await time.increase(3600);
      let latestBlock = await signer.provider?.getBlock('latest')
      await timeTravel({ seconds: 20000, signer });
      latestBlock = await signer.provider?.getBlock(Number(latestBlock?.number) + 1)
      poll = await getPoll({ maciAddress: maci.address, signer });
      console.log(poll)
      const now = Number(latestBlock?.timestamp)
      console.log(now, partyEndTime)

      // generate proofs and tally
      console.log('merging messages')
      await mergeMessages({ pollId: BigInt(poll.id), maciAddress: maci.address, signer });
      console.log('merging signups')
      await mergeSignups({ pollId: BigInt(poll.id), maciAddress: maci.address, signer });
      console.log('gen proofs')
      await genProofs({
        outputDir: './proofs',
        tallyFile: './tally.json',
        tallyZkey: './zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey',
        processZkey: './zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey',
        pollId: BigInt(poll.id),
        processWitgen: './zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_cpp/ProcessMessages_10-2-1-2_test',
        processDatFile: './zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_cpp/ProcessMessages_10-2-1-2_test.dat',
        tallyWitgen: './zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_cpp/TallyVotes_10-1-2_test',
        tallyDatFile: './zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_cpp/TallyVotes_10-1-2_test.dat',
        coordinatorPrivKey: process.env.COORDINATOR_PRIVKEY,
        maciAddress: maci.address,
        processWasm: './zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_js/ProcessMessages_10-2-1-2_test.wasm',
        tallyWasm: './zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_js/TallyVotes_10-1-2_test.wasm',
        useWasm: true,
        useQuadraticVoting: true,
        signer
      });
      console.log('prove on chain')
      await proveOnChain({ pollId: BigInt(poll.id), proofDir: './proofs', signer, maciAddress: maci.address });
      console.log('verify')
      await verify({ ...(await verifyArgs()), pollId: BigInt(poll.id), maciAddress: maci.address, signer });
      const tally = require("../tally.json");

      // finalize party
      await sniperPartyManager.write.finalizeParty([
        0n,
        BigInt(tally.totalSpentVoiceCredits.spent),
        BigInt(tally.totalSpentVoiceCredits.salt),
        BigInt(tally.results.commitment),
        BigInt(tally.perVOSpentVoiceCredits.commitment)
      ]);

      const claimData = getRecipientClaimData(
        0,
        2,
        tally
      )

      await sniperPartyManager.write.claimFunds([
        0n,
        ...claimData]);

      const othersReward = await mockUSDC.read.balanceOf([otherAccount.account.address])
      expect(othersReward).to.eq(BigInt(tally.totalSpentVoiceCredits.spent) * 10n ** 6n);
    });
  });
});