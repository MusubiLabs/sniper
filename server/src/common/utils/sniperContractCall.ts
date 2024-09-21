import * as ethers from 'ethers';
import { abi } from '../constants/sniperAbi';

interface CompletedDetails {
  distractionScore: bigint;
  productivityScore: bigint;
  finalDuration: bigint;
  ipfsHash: string;
}

export default async function sniperContractCall(
  userId: string,
  zoneId: number,
  details: any
) {
  const provider = new ethers.JsonRpcProvider('https://sepolia.optimism.io');
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.FOCUS_CONTRACT_ADRESS;
  const wallet = new ethers.Wallet(privateKey, provider);

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  try {
    const tx = await contract.completeSession(userId, zoneId, details);
    console.log('Transaction hash:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
  } catch (error) {
    throw new Error(error);
  }
}
