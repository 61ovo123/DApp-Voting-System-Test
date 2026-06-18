'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { CHAIN_IDS, NETWORK_CONFIGS, DEFAULT_CHAIN_ID, BALLOT_STORAGE_KEYS } from '@/lib/constants';
import { useWallet } from '@/context/WalletContext';
import { switchNetwork } from '@/lib/web3/utils';
import { translations } from '@/lib/i18n';

const t = translations;

export function NetworkSelector() {
  const { chainId, provider } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState(chainId || DEFAULT_CHAIN_ID);
  const [isSwitching, setIsSwitching] = useState(false);

  // 从本地存储加载上次选择
  useEffect(() => {
    const savedNetwork = localStorage.getItem(BALLOT_STORAGE_KEYS.SELECTED_NETWORK);
    if (savedNetwork) {
      setSelectedChainId(parseInt(savedNetwork));
    }
  }, []);

  // 保存选择到本地存储
  useEffect(() => {
    localStorage.setItem(BALLOT_STORAGE_KEYS.SELECTED_NETWORK, selectedChainId.toString());
  }, [selectedChainId]);

  // 当钱包连接后，同步当前链 ID
  useEffect(() => {
    if (chainId) {
      setSelectedChainId(chainId);
    }
  }, [chainId]);

  const handleNetworkChange = async (newChainId) => {
    if (newChainId === selectedChainId) return;

    setIsSwitching(true);
    try {
      if (provider) {
        await switchNetwork(newChainId);
        setSelectedChainId(newChainId);
      }
    } catch (error) {
      console.error('切换网络失败:', error);
    } finally {
      setIsSwitching(false);
      setIsOpen(false);
    }
  };

  const currentConfig = NETWORK_CONFIGS[selectedChainId] || NETWORK_CONFIGS[DEFAULT_CHAIN_ID];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {isSwitching ? t.common.switching : currentConfig.chainName}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              {Object.values(NETWORK_CONFIGS).map((config) => (
                <button
                  key={config.chainId}
                  onClick={() => handleNetworkChange(config.chainId)}
                  disabled={isSwitching}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedChainId === config.chainId
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">{config.chainName}</span>
                  </div>
                  {selectedChainId === config.chainId && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}