import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { SniperContract } from '@renderer/lib/sniper'
import { SniperPointContract } from '@renderer/lib/sniperPoint'
import { WorldVerifierContract } from '@renderer/lib/worldIdverifier'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useEffect } from 'react'
import { PublicClient, WalletClient } from 'viem'
import { VoteService } from '@renderer/lib/vote'

export default function Web3ContentLayer() {
  const isLoggedIn = useIsLoggedIn()
  const { primaryWallet, sdkHasLoaded } = useDynamicContext()
  const {
    setWorldVerifierContract,
    setIsWorldIdVerified,
    setSnipertContract,
    setSniperPointContract,
    setVoteService
  } = useWeb3Content((state) => ({
    setWorldVerifierContract: state.setWorldVerifierContract,
    setIsWorldIdVerified: state.setIsWorldIdVerified,
    setSnipertContract: state.setSnipertContract,
    setSniperPointContract: state.setSniperPointContract,
    setVoteService: state.setVoteService
  }))

  const loadCliend = async () => {
    const walletClient = (await primaryWallet?.connector?.getWalletClient()) as WalletClient
    const publicClient = (await primaryWallet?.connector?.getPublicClient()) as PublicClient

    let worldIdverifier: WorldVerifierContract | null = null
    let sniperContract: SniperContract | null = null
    let sniperPointContract: SniperPointContract | null = null
    let voteService: VoteService | null = null

    if (publicClient && walletClient) {
      worldIdverifier = new WorldVerifierContract(
        import.meta.env.VITE_WORLD_VERIFIER_CONTRACT_ADDRESS,
        publicClient,
        walletClient
      )

      sniperContract = new SniperContract(
        import.meta.env.VITE_FOCUS_CONTRACT_ADDRESS,
        publicClient,
        walletClient
      )

      sniperPointContract = new SniperPointContract(
        import.meta.env.VITE_FOCUS_POINT_CONTRACT_ADDRESS,
        publicClient,
        walletClient
      )
      
      voteService = new VoteService(
        publicClient,
        walletClient,
        import.meta.env.VITE_WORLD_VERIFIER_CONTRACT_ADDRESS
      )
    }

    if (sniperContract) {
      setSnipertContract(sniperContract)
    }

    if (sniperPointContract) {
      setSniperPointContract(sniperPointContract)
    }

    if (worldIdverifier) {
      setWorldVerifierContract(worldIdverifier)
      const isHuman = await worldIdverifier.isHuman(walletClient.account?.address as string)
      setIsWorldIdVerified(!!isHuman)
    }

    if (voteService) {
      setVoteService(voteService)
    }

    console.log(12312313)
  }

  useEffect(() => {
    if (!isLoggedIn || !sdkHasLoaded) {
      return
    }

    loadCliend()
  }, [isLoggedIn, primaryWallet])

  return null
}