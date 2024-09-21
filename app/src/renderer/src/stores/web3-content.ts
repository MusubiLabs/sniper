import { SniperContract } from '@renderer/lib/sniper'
import { SniperPointContract } from '@renderer/lib/sniperCoin'
import { VoteService } from '@renderer/lib/vote'
import { WorldVerifierContract } from '@renderer/lib/worldIdverifier'
import { create } from 'zustand'

export type TWeb3Content = {
  isWorldIdVerifing: boolean
  isWorldIdVerified: boolean
  worldVerifierContract: WorldVerifierContract | null
  snipertContract: SniperContract | null
  sniperCoinContract: SniperPointContract | null
  voteService: VoteService | null
  setIsWorldIdVerifing: (isWorldIdVerifing: boolean) => void
  setIsWorldIdVerified: (isVerified: boolean) => void
  setSnipertContract: (contract: SniperContract | null) => void
  setWorldVerifierContract: (contract: WorldVerifierContract | null) => void
  setSniperPointContract: (contract: SniperPointContract | null) => void
  setVoteService: (service: VoteService | null) => void
}

export const useWeb3Content = create<TWeb3Content>((set) => ({
  isWorldIdVerifing: false,
  isWorldIdVerified: false,
  worldVerifierContract: null,
  snipertContract: null,
  sniperCoinContract: null,
  voteService: null,
  setIsWorldIdVerifing: (isWorldIdVerifing) =>
    set((state) => ({ ...state, isWorldIdVerified: isWorldIdVerifing })),
  setIsWorldIdVerified: (isVerified) =>
    set((state) => ({ ...state, isWorldIdVerified: isVerified })),
  setSnipertContract: (contract) => set((state) => ({ ...state, snipertContract: contract })),
  setWorldVerifierContract: (contract) =>
    set((state) => ({ ...state, worldVerifierContract: contract })),
  setSniperPointContract: (contract) => set((state) => ({ ...state, sniperCoinContract: contract })),
  setVoteService: (service) => set((state) => ({ ...state, voteService: service}))
}))
