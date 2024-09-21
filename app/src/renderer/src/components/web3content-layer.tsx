import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { SniperContract } from '@renderer/lib/sniper'
import { SniperPointContract } from '@renderer/lib/sniperPoint'
import { SniperPartyManager } from '@renderer/lib/party'
import { VoteService } from '@renderer/lib/vote'
import { USDCContract } from '@renderer/lib/usdc'
import { WorldVerifierContract } from '@renderer/lib/worldIdverifier'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useEffect } from 'react'
import { PublicClient, WalletClient } from 'viem'

export default function Web3ContentLayer() {
  const isLoggedIn = useIsLoggedIn()
  const { primaryWallet, sdkHasLoaded } = useDynamicContext()
  const {
    setWorldVerifierContract,
    setIsWorldIdVerified,
    setSnipertContract,
    setSniperPointContract,
    setVoteService,
    setSniperPartyManager,
    setUSDContract
  } = useWeb3Content((state) => ({
    setWorldVerifierContract: state.setWorldVerifierContract,
    setIsWorldIdVerified: state.setIsWorldIdVerified,
    setSnipertContract: state.setSnipertContract,
    setSniperPointContract: state.setSniperPointContract,
    setVoteService: state.setVoteService,
    setSniperPartyManager: state.setSniperPartyManager,
    setUSDContract: state.setUSDContract
  }))

  const loadCliend = async () => {
    const walletClient = (await primaryWallet?.connector?.getWalletClient()) as WalletClient
    const publicClient = (await primaryWallet?.connector?.getPublicClient()) as PublicClient

    let worldIdverifier: WorldVerifierContract | null = null
    let sniperContract: SniperContract | null = null
    let sniperPointContract: SniperPointContract | null = null
    let voteService: VoteService | null = null
    let sniperPartyManager: SniperPartyManager | null = null
    let usdcContract: USDCContract | null = null

    if (publicClient && walletClient) {
      worldIdverifier = new WorldVerifierContract(
        import.meta.env.VITE_WORLD_VERIFIER_CONTRACT_ADDRESS,
        publicClient,
        walletClient
      )

      sniperContract = new SniperContract(
        import.meta.env.VITE_SNIPER_CONTRACT_ADDRESS,
        publicClient,
        walletClient
      )

      sniperPointContract = new SniperPointContract(
        import.meta.env.VITE_SNIPER_COIN_CONTRACT_ADDRESS,
        publicClient,
        walletClient
      )

      voteService = new VoteService(
        publicClient,
        walletClient,
        import.meta.env.VITE_WORLD_VERIFIER_CONTRACT_ADDRESS
      )

      sniperPartyManager = new SniperPartyManager(
        import.meta.env.VITE_SNIPER_PARTY_MANAGER,
        publicClient,
        walletClient
      )

      usdcContract = new USDCContract(
        import.meta.env.VITE_USDC_CONTRACT_ADDRESS,
        publicClient,
        walletClient
      )
    }

    if (sniperContract) {
      setSnipertContract(sniperContract)
    }

    if (sniperPointContract) {
      setSniperPointContract(sniperPointContract)
    }

    if (voteService) {
      setVoteService(voteService)
    }

    if (usdcContract) {
      setUSDContract(usdcContract)
    }

    if (sniperPartyManager) {
      setSniperPartyManager(sniperPartyManager)
    }

    if (worldIdverifier) {
      setWorldVerifierContract(worldIdverifier)
      const isHuman = await worldIdverifier.isHuman(walletClient.account?.address as string)
      // TODO: 暂时跳过 worldId 的验证
      setIsWorldIdVerified(!!isHuman)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || !sdkHasLoaded) {
      return
    }

    loadCliend()
  }, [isLoggedIn, primaryWallet])

  return null
}
