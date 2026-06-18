import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';

export function useAuth(requiredRole = null) {
  const { isConnected, account } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isConnected || !account) {
      setIsAuthenticated(false);
      setIsAuthorized(false);
      router.push('/');
      return;
    }

    setIsAuthenticated(true);

    if (requiredRole === 'admin') {
      const ADMIN_ADDRESSES = [];
      const isAdminAccount = ADMIN_ADDRESSES.some(
        addr => addr.toLowerCase() === account.toLowerCase()
      );
      setIsAuthorized(isAdminAccount);
      if (!isAdminAccount) {
        router.push('/voter');
      }
    } else {
      setIsAuthorized(true);
    }
  }, [isConnected, account, router, mounted, requiredRole]);

  return {
    isAuthenticated,
    isAuthorized,
    mounted,
    isConnected,
    account,
  };
}

export function useRequireAuth() {
  return useAuth();
}

export function useRequireAdmin() {
  return useAuth('admin');
}