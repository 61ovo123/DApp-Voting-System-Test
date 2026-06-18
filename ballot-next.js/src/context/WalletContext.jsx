'use client';

import { createContext, useContext } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { account, isConnected, chainId, provider, signer, isLoading, connect, disconnect } = useWeb3();

  const value = {
    account,
    isConnected,
    chainId,
    provider,
    signer,
    isLoading,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}