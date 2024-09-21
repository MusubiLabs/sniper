import {
  DynamicConnectButton,
  useDynamicContext,
  useIsLoggedIn
} from '@dynamic-labs/sdk-react-core'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit'
import { Globe, Loader2, Wallet } from 'lucide-react'
import { ReactNode } from 'react'
import { decodeAbiParameters } from 'viem'
import { Button } from '../ui/button'

export default function LoginLayer({ children }: { children: ReactNode }) {
  const isLoggedIn = useIsLoggedIn()
  const { sdkHasLoaded } = useDynamicContext()
  const connectWallet = useConnectedWallet()

  const { worldVerifierContract } = useWeb3Content((state) => ({
    worldVerifierContract: state.worldVerifierContract
  }))

  const { isWorldIdVerified } = useWeb3Content((state) => ({
    isWorldIdVerified: state.isWorldIdVerified
  }))

  const { setIsWorldIdVerified } = useWeb3Content((state) => ({
    setIsWorldIdVerified: state.setIsWorldIdVerified
  }))

  const handleVerify = async (proof: ISuccessResult) => {
    const decodeProof = decodeAbiParameters(
      [{ type: 'uint256[8]' }],
      proof.proof as `0x${string}`
    )[0]

    try {
      await worldVerifierContract?.verifyWorldAction(
        BigInt(proof.merkle_root),
        BigInt(proof.nullifier_hash),
        decodeProof
      )

      setIsWorldIdVerified(true)
    } catch (error) {
      console.error(error)
    }
  }

  const onVerifySuccess = () => {
    setIsWorldIdVerified(true)
  }

  if (!sdkHasLoaded) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    )
  }

  // 用户用户没有使用 dynamic 登陆，直接跳转到首页
  if (!isLoggedIn) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <DynamicConnectButton>
          <Button className="bg-[#FF6600] hover:bg-[#FF8533] text-white font-bold py-2 px-4 rounded-md shadow-lg transform transition duration-200 ease-in-out hover:scale-105 flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Connect Wallet</span>
          </Button>
        </DynamicConnectButton>
      </div>
    )
  }

  // 用户没有认证worldId，显示worldId登陆页面
  if (!isWorldIdVerified) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <IDKitWidget
          app_id={import.meta.env.VITE_WORLD_APP_ID as `app_${string}`}
          action="verify"
          verification_level={VerificationLevel.Orb}
          signal={connectWallet?.address}
          handleVerify={handleVerify}
          onSuccess={onVerifySuccess}
        >
          {({ open }) => (
            <Button disabled={!worldVerifierContract} onClick={open}>
              {!worldVerifierContract ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Veriying
                </>
              ) : (
                <>
                  <Globe className="mr-2" size={20} />
                  Verify with WorldID
                </>
              )}
            </Button>
          )}
        </IDKitWidget>
      </div>
    )
  }

  // 用户已经登陆，直接跳转到首页
  return children
}
