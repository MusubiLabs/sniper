import { SniperContract } from '@renderer/lib/sniper'
import { SniperPointContract } from '@renderer/lib/sniperPoint'
import { SniperPartyManager } from '@renderer/lib/party'
import { VoteService } from '@renderer/lib/vote'
import { WorldVerifierContract } from '@renderer/lib/worldIdverifier'
import { USDCContract } from '@renderer/lib/usdc'
import { create } from 'zustand'

export type TWeb3Content = {
  isWorldIdVerifing: boolean
  isWorldIdVerified: boolean
  worldVerifierContract: WorldVerifierContract | null
  snipertContract: SniperContract | null
  sniperPointContract: SniperPointContract | null
  voteService: VoteService | null
  sniperPartyManager: SniperPartyManager | null
  usdcContract: USDCContract | null
  setIsWorldIdVerifing: (isWorldIdVerifing: boolean) => void
  setIsWorldIdVerified: (isVerified: boolean) => void
  setSnipertContract: (contract: SniperContract | null) => void
  setWorldVerifierContract: (contract: WorldVerifierContract | null) => void
  setSniperPointContract: (contract: SniperPointContract | null) => void
  setVoteService: (service: VoteService | null) => void
  setSniperPartyManager: (manager: SniperPartyManager | null) => void
  setUSDContract: (contract: USDCContract | null) => void
}

export const useWeb3Content = create<TWeb3Content>((set) => ({
  isWorldIdVerifing: false,
  isWorldIdVerified: false,
  worldVerifierContract: null,
  snipertContract: null,
  sniperPointContract: null,
  voteService: null,
  sniperPartyManager: null,
  usdcContract: null,
  setIsWorldIdVerifing: (isWorldIdVerifing) =>
    set((state) => ({ ...state, isWorldIdVerified: isWorldIdVerifing })),
  setIsWorldIdVerified: (isVerified) =>
    set((state) => ({ ...state, isWorldIdVerified: isVerified })),
  setSnipertContract: (contract) => set((state) => ({ ...state, snipertContract: contract })),
  setWorldVerifierContract: (contract) =>
    set((state) => ({ ...state, worldVerifierContract: contract })),
  setSniperPointContract: (contract) => set((state) => ({ ...state, sniperPointContract: contract })),
  setVoteService: (service) => set((state) => ({ ...state, voteService: service })),
  setSniperPartyManager: (manager) => set((state) => ({ ...state, sniperPartyManager: manager })),
  setUSDContract: (contract) => set((state) => ({ ...state, usdcContract: contract}))
}))
