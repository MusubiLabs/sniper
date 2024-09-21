import { useUserWallets } from '@dynamic-labs/sdk-react-core';
import { useMemo } from 'react';

export const useConnectedWallet = () => {
  const wallets = useUserWallets();

  const connectedWallet = useMemo(() => {
    return wallets?.find((wallet) => !!wallet.connected);
  }, [wallets]);

  return connectedWallet;
};
