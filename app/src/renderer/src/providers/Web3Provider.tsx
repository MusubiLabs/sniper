import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: 'b94fb349-56b2-4d9b-be27-b16a8d768c37',
        walletConnectors: [EthereumWalletConnectors]
      }}
    >
      {children}
    </DynamicContextProvider>
  )
}
