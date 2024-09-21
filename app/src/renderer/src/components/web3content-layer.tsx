import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { SniperContract } from '@renderer/lib/sniper'
import { WorldVerifierContract } from '@renderer/lib/worldIdverifier'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useEffect } from 'react'
import { PublicClient, WalletClient } from 'viem'
export default function Web3ContentLayer() {
  const isLoggedIn = useIsLoggedIn()
  const { primaryWallet, sdkHasLoaded } = useDynamicContext()
  const { setWorldVerifierContract, setIsWorldIdVerified, setSnipertContract } = useWeb3Content(
    (state) => ({
      setWorldVerifierContract: state.setWorldVerifierContract,
      setIsWorldIdVerified: state.setIsWorldIdVerified,
      setSnipertContract: state.setSnipertContract
    })
  )
  const loadCliend = async () => {
    const walletClient = (await primaryWallet?.connector?.getWalletClient()) as WalletClient
    const publicClient = (await primaryWallet?.connector?.getPublicClient()) as PublicClient
    let worldIdverifier: WorldVerifierContract | null = null
    let sniperContract: SniperContract | null = null
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
    }
    if (sniperContract) {
      setSnipertContract(sniperContract)
    }
    if (worldIdverifier) {
      setWorldVerifierContract(worldIdverifier)
      const isHuman = await worldIdverifier.isHuman(walletClient.account?.address as string)
      setIsWorldIdVerified(!!isHuman)
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