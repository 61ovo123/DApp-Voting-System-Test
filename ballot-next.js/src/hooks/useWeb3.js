import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { connectWallet, getProvider, getSigner, switchNetwork } from '@/lib/web3/utils';
import { DEFAULT_CHAIN_ID, BALLOT_STORAGE_KEYS } from '@/lib/constants';

// 内联定义 getChainId 确保函数可用
async function getChainId(provider) {
  try {
    const network = await provider.getNetwork();
    return network.chainId;
  } catch (error) {
    throw error;
  }
}

export function useWeb3() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connectedAccount = await connectWallet();
      const providerInstance = getProvider();
      const signerInstance = await getSigner(providerInstance);
      const chainIdValue = await getChainId(providerInstance);
      
      // 从本地存储读取上次选择的网络
      const savedNetwork = localStorage.getItem(BALLOT_STORAGE_KEYS.SELECTED_NETWORK);
      const targetChainId = savedNetwork ? parseInt(savedNetwork) : DEFAULT_CHAIN_ID;
      
      if (chainIdValue !== targetChainId) {
        await switchNetwork(targetChainId);
      }
      
      setAccount(connectedAccount);
      setIsConnected(true);
      setProvider(providerInstance);
      setSigner(signerInstance);
      setChainId(targetChainId);
      
      localStorage.setItem(BALLOT_STORAGE_KEYS.WALLET_CONNECTED, 'true');
    } catch (err) {
      setError(err.message);
      console.error('Web3 connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setError(null);
    localStorage.removeItem(BALLOT_STORAGE_KEYS.WALLET_CONNECTED);
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedConnected = localStorage.getItem(BALLOT_STORAGE_KEYS.WALLET_CONNECTED);
      
      if (storedConnected && window.ethereum) {
        try {
          const providerInstance = getProvider();
          const signerInstance = await getSigner(providerInstance);
          const connectedAccount = await signerInstance.getAddress();
          const chainIdValue = await getChainId(providerInstance);
          
          setAccount(connectedAccount);
          setIsConnected(true);
          setProvider(providerInstance);
          setSigner(signerInstance);
          setChainId(chainIdValue);
        } catch (err) {
          console.error('Auto-connect failed:', err);
          localStorage.removeItem(BALLOT_STORAGE_KEYS.WALLET_CONNECTED);
        }
      }
    };

    init();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const chainIdValue = parseInt(chainIdHex, 16);
      setChainId(chainIdValue);
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [disconnect]);

  return {
    account,
    isConnected,
    chainId,
    provider,
    signer,
    isLoading,
    error,
    connect,
    disconnect,
  };
}