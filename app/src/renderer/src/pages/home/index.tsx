import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { SniperContract } from '@renderer/lib/sniper'
import { useEffect, useState } from 'react'
import { PublicClient, WalletClient } from 'viem'
import TODO from './todo-list'

export default function HomePage() {
  const [sniperContract, setSniperContract] = useState<SniperContract | null>(null)
  const { primaryWallet } = useDynamicContext()

  useEffect(() => {
    const loadClient = async () => {
      const walletClient = (await primaryWallet?.connector?.getWalletClient()) as WalletClient
      const publicClient = (await primaryWallet?.connector?.getPublicClient()) as PublicClient
      if (walletClient && publicClient) {
        setSniperContract(
          new SniperContract(import.meta.env.VITE_FOCUS_CONTRACT_ADDRESS, publicClient, walletClient)
        )
      }
    }
    loadClient()
  }, [primaryWallet])

  return (
    <div className="p-4">
      <TODO sniperContract={sniperContract} />
    </div>
  )
}
