import { IndexService } from "@ethsign/sp-sdk";
import { decodeEventLog, getContract, GetContractReturnType, PublicClient, WalletClient } from 'viem';
import { genRandomSalt, SNARK_FIELD_SIZE } from "maci-crypto";
import { encodeAbiParameters, keccak256, toHex } from "viem";
import { contractExists, validateSalt } from "./utils";
import { PCommand, PubKey, PrivKey, Keypair } from 'maci-domainobjs';
import { maciAbi, pollAbi } from './abi';
interface ISignupData {
    /**
     * The state index of the user
     */
    stateIndex: string;

    /**
     * The voice credits of the user
     */
    voiceCredits: number;

    /**
     * The signup transaction hash
     */
    hash: string;
}
/**
 * Interface that represents user publish message
 */
export interface IPublishMessage {
    /**
     * The index of the state leaf
     */
    stateIndex: bigint;

    /**
     * The index of the vote option
     */
    voteOptionIndex: bigint;

    /**
     * The nonce of the message
     */
    nonce: bigint;

    /**
     * The new vote weight
     */
    newVoteWeight: bigint;

    /**
     * The salt of the message
     */
    salt?: bigint;
}
export interface PublishArgs extends IPublishMessage {
    /**
     * The public key of the user
     */
    pubkey: string;

    /**
     * The private key of the user
     */
    privateKey: string;

    /**
     * The address of the MACI contract
     */
    maciAddress: `0x${string}`;

    /**
     * The id of the poll
     */
    pollId: bigint;


}
interface IGenKeypairArgs {
    /**
     * Seed value for keypair
     */
    seed?: bigint;

}
class VoteService {

    public publicClient: PublicClient
    private walletClient: WalletClient
    private indexService: IndexService;
    private sniperWorldVerifierAddress: string;
    // the default signup gatekeeper data
    private DEFAULT_SG_DATA = "0x0000000000000000000000000000000000000000000000000000000000000000";
    // the default initial voice credit proxy data
    private DEFAULT_IVCP_DATA = "0x0000000000000000000000000000000000000000000000000000000000000000";
    private MESSAGE_TREE_ARITY = 5;

    constructor(publicClient: PublicClient, walletClient: WalletClient, sniperWorldVerifierAddress: string) {
        this.walletClient = walletClient
        this.publicClient = publicClient
        this.sniperWorldVerifierAddress = sniperWorldVerifierAddress;
        this.indexService = new IndexService("testnet");
    }
    private genKeyPair({ seed }: IGenKeypairArgs): { publicKey: string; privateKey: string } {
        // create the new random keypair if there is no seed value
        const keypair = new Keypair(seed ? new PrivKey(seed % SNARK_FIELD_SIZE) : undefined);

        // serialize both private and public keys
        const serializedPubKey = keypair.pubKey.serialize();
        const serializedPrivKey = keypair.privKey.serialize();

        console.log(`Public key: ${serializedPubKey}`);
        console.log(`Private key: ${serializedPrivKey}`);

        return {
            publicKey: serializedPubKey,
            privateKey: serializedPrivKey,
        };
    };

    // Generate the MACI keypair based on the signer
    private async getKeyPair() {
        const account = (await this.walletClient.getAddresses())[0];
        const message = "Generate MACI keypair for Sniper party voting.";
        const seed = BigInt(keccak256(
            toHex(
                await this.walletClient.signMessage({ account, message })
            )
        ));
        const maciKeyPair = await this.genKeyPair({ seed });
        return maciKeyPair;
    }

    /**
     * Signup a user to the MACI contract
     * @param {SignupArgs} args - The arguments for the signup command
     * @returns {ISignupData} The state index of the user and transaction hash
     */
    public async signup(
        maciPubKey,
        maciAddress,
        sgDataArg,
        ivcpDataArg,
    ): Promise<ISignupData> {


        // validate user key
        if (!PubKey.isValidSerializedPubKey(maciPubKey)) {
            console.error("Invalid MACI public key");
        }

        const userMaciPubKey = PubKey.deserialize(maciPubKey);

        if (!(await contractExists(this.publicClient, maciAddress))) {
            console.error("There is no contract deployed at the specified address");
        }

        const sgData = sgDataArg || this.DEFAULT_SG_DATA;
        const ivcpData = ivcpDataArg || this.DEFAULT_IVCP_DATA;


        const maciContract = getContract({ address: maciAddress, abi: maciAbi, client: { public: this.publicClient, wallet: this.walletClient } });

        let _stateIndex = "";
        let _voiceCreditBalance = "";
        let receipt;

        try {
            // sign up to the MACI contract
            const tx = await maciContract.write.signUp([userMaciPubKey.asContractParam(), sgData, ivcpData]);


            console.log(`Transaction hash: ${tx}`);

            const receipt = await this.publicClient.getTransactionReceipt({ hash: tx });
            if (receipt?.status !== "success") {
                console.error("The transaction failed");
            }

            // get state index from the event
            if (receipt?.logs) {
                const [log] = receipt.logs;
                const { args } = decodeEventLog({ abi: maciAbi, data: log.data, topics: log.topics }) as any;
                _stateIndex = args?._stateIndex;
                _voiceCreditBalance = args?._voiceCreditBalance;
                console.log(`State index: ${_stateIndex.toString()}`);
            } else {
                console.error("Unable to retrieve the transaction receipt");
            }
        } catch (error) {
            console.error((error as Error).message);
        }

        return {
            stateIndex: _stateIndex ? _stateIndex.toString() : "",
            voiceCredits: _voiceCreditBalance ? Number.parseInt(_voiceCreditBalance, 10) : 0,
            hash: receipt!.hash,
        };
    };

    /**
     * Parse the signup events from the MACI contract
     */
    private async parseSignupEvents(maciContract: GetContractReturnType, startBlock, currentBlock, publicKey: PubKey) {
        // 1000 blocks at a time

        // eslint-disable-next-line no-await-in-loop
        const newEvents = await this.publicClient.getLogs({
            address: maciContract.address,
            event: {
                name: "SignUp",
                type: "event",
                inputs: [
                    {
                        "indexed": false,
                        "name": "_stateIndex",
                        type: "uint256"
                    },
                    {
                        "indexed": true,
                        "name": "_userPubKeyX",
                        type: "uint256"
                    },
                    {
                        "indexed": true,
                        "name": "_userPubKeyY",
                        type: "uint256"
                    },
                    {
                        "indexed": false,
                        "name": "_voiceCreditBalance",
                        type: "uint256"
                    },
                    {
                        "indexed": false,
                        "name": "_timestamp",
                        type: "uint256"
                    }
                ],
            },
            args: {
                _userPubKeyX: BigInt(publicKey.asContractParam().x),
                _userPubKeyY: BigInt(publicKey.asContractParam().y),
            },
            fromBlock: BigInt(startBlock),
            toBlock: BigInt(currentBlock)
        })

        if (newEvents.length > 0) {
            const [event] = newEvents;

            return {
                stateIndex: event.args._stateIndex?.toString(),
                voiceCredits: event.args._voiceCreditBalance?.toString(),
            };
        }


        return {
            stateIndex: undefined,
            voiceCredits: undefined,
        };
    };

    /**
     * Checks if user is registered with public key
     * @param IRegisteredArgs - The arguments for the register check command
     * @returns user registered or not and state index, voice credit balance
     */
    private async isRegisteredUser(
        maciAddress,
        maciPubKey,
        startBlock,
    ): Promise<{ isRegistered: boolean; stateIndex?: string; voiceCredits?: string }> {


        const maciContract = getContract({ address: maciAddress, abi: maciAbi, client: { public: this.publicClient, wallet: this.walletClient } }) as any;
        const publicKey = PubKey.deserialize(maciPubKey);
        const startBlockNumber = startBlock || 0;
        const currentBlock = await this.publicClient.getBlockNumber();

        const { stateIndex, voiceCredits } = await this.parseSignupEvents(
            maciContract,
            startBlockNumber,
            Number(currentBlock),
            publicKey,
        );


        return {
            isRegistered: stateIndex !== undefined,
            stateIndex,
            voiceCredits,
        };
    };


    /**
     * Publish a new message to a MACI Poll contract
     * @param PublishArgs - The arguments for the publish command
     * @returns The ephemeral private key used to encrypt the message
     */
    private async publish({
        pubkey,
        stateIndex,
        voteOptionIndex,
        nonce,
        pollId,
        newVoteWeight,
        maciAddress,
        salt,
        privateKey
    }: PublishArgs): Promise<string> {

        // validate that the pub key of the user is valid
        if (!PubKey.isValidSerializedPubKey(pubkey)) {
            console.error("invalid MACI public key");
        }
        // deserialize
        const userMaciPubKey = PubKey.deserialize(pubkey);

        if (!(await contractExists(this.publicClient, maciAddress))) {
            console.error("MACI contract does not exist");
        }

        if (!PrivKey.isValidSerializedPrivKey(privateKey)) {
            console.error("Invalid MACI private key");
        }

        const userMaciPrivKey = PrivKey.deserialize(privateKey);

        // validate args
        if (voteOptionIndex < 0) {
            console.error("invalid vote option index");
        }

        // check < 1 cause index zero is a blank state leaf
        if (stateIndex < 1) {
            console.error("invalid state index");
        }

        if (nonce < 0) {
            console.error("invalid nonce");
        }

        if (salt && !validateSalt(salt)) {
            console.error("Invalid salt");
        }

        const userSalt = salt ? BigInt(salt) : genRandomSalt();

        if (pollId < 0) {
            console.error("Invalid poll id");
        }

        const maciContract = getContract({ address: maciAddress, abi: maciAbi, client: { public: this.publicClient, wallet: this.walletClient } });
        const pollContracts = await maciContract.read.getPoll([pollId]) as any;

        if (!(await contractExists(this.publicClient, pollContracts.poll))) {
            console.error("Poll contract does not exist");
        }

        const pollContract = getContract({ address: pollContracts.poll, abi: pollAbi, client: { public: this.publicClient, wallet: this.walletClient } });

        const treeDepths = await pollContract.read.treeDepths() as any;
        const coordinatorPubKeyResult = await pollContract.read.coordinatorPubKey() as any;
        const maxVoteOptions = this.MESSAGE_TREE_ARITY ** Number(treeDepths.voteOptionTreeDepth);

        // validate the vote options index against the max leaf index on-chain
        if (maxVoteOptions < voteOptionIndex) {
            console.error("Invalid vote option index");
        }

        const coordinatorPubKey = new PubKey([
            BigInt(coordinatorPubKeyResult[0]),
            BigInt(coordinatorPubKeyResult[1]),
        ]);

        const encKeypair = new Keypair();

        // create the command object
        const command: PCommand = new PCommand(
            stateIndex,
            userMaciPubKey,
            voteOptionIndex,
            newVoteWeight,
            nonce,
            BigInt(pollId),
            userSalt,
        );

        // sign the command with the user private key
        const signature = command.sign(userMaciPrivKey);
        // encrypt the command using a shared key between the user and the coordinator
        const message = command.encrypt(signature, Keypair.genEcdhSharedKey(encKeypair.privKey, coordinatorPubKey));

        try {
            // submit the message onchain as well as the encryption public key
            const tx = await pollContract.write.publishMessage([message.asContractParam(), encKeypair.pubKey.asContractParam()]);


            const receipt = await this.publicClient.getTransactionReceipt({ hash: tx });
            if (receipt?.status !== 'success') {
                console.error("Transaction failed");
            }

            console.log(`Transaction hash: ${receipt!.transactionHash}`);
            console.log(`Ephemeral private key: ${encKeypair.privKey.serialize()}`);
        } catch (error) {
            console.error((error as Error).message);
        }

        // we want the user to have the ephemeral private key
        return encKeypair.privKey.serialize();
    };


    // Perform the vote process
    public async vote(
        partyId: bigint,
        partyStartBlock: number, // from party subgraph
        maciAddress: `0x${string}`,
        pollId: bigint,
        voteOptionIndex: bigint
    ) {
        try {
            // Step 1: Get MACI keypair
            const keypair = await this.getKeyPair();
            console.log("Keypair:", keypair);
            console.log(PrivKey.deserialize(keypair.privateKey))
            console.log(PubKey.deserialize(keypair.publicKey))
            const users = await this.walletClient.getAddresses()
            // Step 2: Query attestation list
            const res = await this.indexService.queryAttestationList({
                attester: this.sniperWorldVerifierAddress,
                page: 1,
                indexingValue: users[0].toLowerCase()
            });

            console.log(1)
            console.log("Attestation List:", res);

            // Step 3: Get the attestation ID
            const ownerVerifyAttestationId = BigInt(res?.rows[0].attestationId as string);
            console.log(1)
            // Step 4: Check if the user is registered
            const registeredUser = await this.isRegisteredUser(
                maciAddress,
                keypair.publicKey,
                partyStartBlock
            );
            console.log(1)
            console.log("Registered User:", registeredUser);

            let stateIndex: bigint;
            let voiceCredits: number;

            if (!registeredUser.isRegistered) {
                // If the user is not registered, sign them up
                const signUpData = await this.signup(
                    keypair.publicKey,
                    maciAddress,
                    encodeAbiParameters(
                        [
                            { name: 'attestationId', type: 'uint64' },
                            { name: 'partyId', type: 'uint256' }
                        ],
                        [ownerVerifyAttestationId, partyId]
                    ),
                    '0x'
                );
                console.log(2)
                stateIndex = BigInt(signUpData.stateIndex as string);
                voiceCredits = Number(signUpData.voiceCredits);

            } else {
                // If already registered, get the state index and voice credits
                stateIndex = BigInt(registeredUser.stateIndex as string);
                voiceCredits = Number(registeredUser.voiceCredits as string);
            }
            console.log(1)
            // Step 5: Publish the vote
            await this.publish({
                pubkey: keypair.publicKey,
                stateIndex: stateIndex,
                voteOptionIndex: voteOptionIndex,
                nonce: 1n,
                pollId: pollId,
                newVoteWeight: BigInt(Math.floor(Math.sqrt(voiceCredits))),
                maciAddress: maciAddress,
                salt: genRandomSalt(),
                privateKey: keypair.privateKey
            });
            console.log(1)
            console.log("Vote published successfully.");
        } catch (e) {
            console.log(e)
        }

    }
}

export { VoteService };
