import { type ClassValue, clsx } from 'clsx'
import { SNARK_FIELD_SIZE } from 'maci-crypto'
import { twMerge } from 'tailwind-merge'
import { PublicClient } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Small utility function to check whether a contract exists at a given address
 * @param provider - the provider to use to interact with the chain
 * @param address - the address of the contract to check
 * @returns a boolean indicating whether the contract exists
 */
export const contractExists = async (
  publicClient: PublicClient,
  address: `0x${string}`
): Promise<boolean> => {
  const code = await publicClient.getCode({ address })
  return code.length > 2
}

/**
 * Run both format check and size check on a salt value
 * @param salt the salt to validate
 * @returns whether it is valid or not
 */
export const validateSalt = (salt: bigint): boolean => salt < SNARK_FIELD_SIZE

export const getSecondTimestamp = (duration: number): number => {
  const currentTime = new Date()
  const futureTime = new Date(currentTime.getTime() + duration * 60 * 1000)
  const futureTimestamp = Math.floor(futureTime.getTime() / 1000)

  return futureTimestamp
}
