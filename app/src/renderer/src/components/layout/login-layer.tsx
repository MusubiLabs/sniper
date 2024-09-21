import {
  DynamicConnectButton,
  useDynamicContext,
  useIsLoggedIn
} from '@dynamic-labs/sdk-react-core'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { WorldVerifierContract } from '@renderer/lib/worldIdverifier'
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit'
import { ReactNode, useEffect, useState } from 'react'
import { decodeAbiParameters, PublicClient, WalletClient } from 'viem'
import { Button } from '../ui/button'

export default function LoginLayer({ children }: { children: ReactNode }) {
  const [isPassWorldIdVerification, setIsPassWorldIdVerification] = useState<boolean>(false)
  const [worldIdverifier, setWorldIdverifier] = useState<WorldVerifierContract | null>(null)

  const { primaryWallet } = useDynamicContext()

  const isLoggedIn = useIsLoggedIn()
  const connectWallet = useConnectedWallet()

  const handleVerify = async (proof: ISuccessResult) => {
    const decodeProof = decodeAbiParameters(
      [{ type: 'uint256[8]' }],
      proof.proof as `0x${string}`
    )[0]
    console.log('decodeProof data:', worldIdverifier, decodeProof)

    try {
      console.log('start verify world action')
      const result = await worldIdverifier?.verifyWorldAction(
        BigInt(proof.merkle_root),
        BigInt(proof.nullifier_hash),
        decodeProof
      )

      console.log('result', result)

      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const onVerifySuccess = () => {
    console.log('/success')
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    const handleVerifyWorldId = async () => {
      const walletClient = (await primaryWallet?.connector?.getWalletClient()) as WalletClient
      const publicClient = (await primaryWallet?.connector?.getPublicClient()) as PublicClient

      console.log('wallets', walletClient, publicClient)

      let worldIdverifier = null

      if (publicClient && walletClient) {
        worldIdverifier = new WorldVerifierContract(
          import.meta.env.VITE_WORLD_VERIFIER_CONTRACT_ADDRESS,
          publicClient,
          walletClient
        )

        console.log(worldIdverifier)

        if (worldIdverifier) {
          setWorldIdverifier(worldIdverifier)

          const isHuman = await worldIdverifier.isHuman(walletClient.account?.address as string)
          setIsPassWorldIdVerification(isHuman)
        }
      }
    }

    handleVerifyWorldId()
  }, [isLoggedIn, primaryWallet])

  // 用户用户没有使用 dynamic 登陆，直接跳转到首页
  if (!isLoggedIn) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <DynamicConnectButton>
          <Button>Connect Wallet</Button>
        </DynamicConnectButton>
      </div>
    )
  }

  // 用户没有认证worldId，显示worldId登陆页面
  if (!isPassWorldIdVerification) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <IDKitWidget
          app_id={import.meta.env.VITE_WORLD_APP_ID as `app_${string}`}
          action="verify"
          // On-chain only accepts Orb verifications
          verification_level={VerificationLevel.Orb}
          signal={connectWallet?.address} // proof will only verify if the signal is unchanged, this prevents tampering
          handleVerify={handleVerify} // callback when the proof is received
          onSuccess={onVerifySuccess} // use onSuccess to call your smart contract
        >
          {({ open }) => (
            <Button disabled={!worldIdverifier} onClick={open}>
              Verify with WorldID
            </Button>
          )}
        </IDKitWidget>
      </div>
    )
  }

  // 用户已经登陆，直接跳转到首页
  return children
}
