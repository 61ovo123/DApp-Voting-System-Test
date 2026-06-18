'use client';

import { WalletProvider } from '@/context/WalletContext';
import { Header } from '@/components/layout/Header';

export function ClientProvider({ children }) {
  return (
    <WalletProvider>
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </WalletProvider>
  );
}