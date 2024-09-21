import { SniperContract } from '@renderer/lib/sniper'
import { WorldVerifierContract } from '@renderer/lib/worldIdverifier'
import { create } from 'zustand'
export type TWeb3Content = {
  isWorldIdVerifing: boolean
  isWorldIdVerified: boolean
  worldVerifierContract: WorldVerifierContract | null
  snipertContract: SniperContract | null
  setIsWorldIdVerifing: (isWorldIdVerifing: boolean) => void
  setIsWorldIdVerified: (isVerified: boolean) => void
  setSnipertContract: (contract: SniperContract | null) => void
  setWorldVerifierContract: (contract: WorldVerifierContract | null) => void
}
export const useWeb3Content = create<TWeb3Content>((set) => ({
  isWorldIdVerifing: false,
  isWorldIdVerified: false,
  worldVerifierContract: null,
  snipertContract: null,
  setIsWorldIdVerifing: (isWorldIdVerifing) =>
    set((state) => ({ ...state, isWorldIdVerified: isWorldIdVerifing })),
  setIsWorldIdVerified: (isVerified) =>
    set((state) => ({ ...state, isWorldIdVerified: isVerified })),
  setSnipertContract: (contract) => set((state) => ({ ...state, snipertContract: contract })),
  setWorldVerifierContract: (contract) =>
    set((state) => ({ ...state, worldVerifierContract: contract }))
}))