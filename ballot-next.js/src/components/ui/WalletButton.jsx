'use client';

import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { formatAddress } from '@/lib/helpers';
import { Button } from '@/components/ui/Button';
import { translations } from '@/lib/i18n';

const t = translations;

export function WalletButton() {
  const { account, isConnected, isLoading, connect, disconnect } = useWallet();
  
  if (isLoading) {
    return (
      <Button loading>
        <Wallet className="w-4 h-4 mr-2" />
        {t.auth.connecting}
      </Button>
    );
  }
  
  if (isConnected && account) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {formatAddress(account)}
        </span>
        <Button variant="secondary" onClick={disconnect}>
          <LogOut className="w-4 h-4 mr-2" />
          {t.common.disconnect}
        </Button>
      </div>
    );
  }
  
  return (
    <Button onClick={connect}>
      <Wallet className="w-4 h-4 mr-2" />
      {t.common.connect}
    </Button>
  );
}