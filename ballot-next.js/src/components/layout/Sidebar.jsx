'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Vote, Users, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { useFactory } from '@/hooks/useFactory';
import { translations } from '@/lib/i18n';

const t = translations;

export function Sidebar() {
  const { disconnect, account, provider } = useWallet();
  const { getBallotsByCreator, isLoading: isLoadingFactory } = useFactory(provider);
  const pathname = usePathname();
  const [roles, setRoles] = useState(['voter']);

  useEffect(() => {
    const checkRoles = async () => {
      if (!account || !provider) return;
      
      try {
        const userBallots = await getBallotsByCreator(account);
        const userRoles = ['voter'];
        
        if (userBallots.length > 0) {
          userRoles.push('chairperson');
        }
        
        setRoles(userRoles);
      } catch (error) {
        console.error('Failed to check roles:', error);
        setRoles(['voter']);
      }
    };
    
    checkRoles();
  }, [account, provider, getBallotsByCreator]);

  const getCurrentPage = () => {
    if (pathname.includes('chairperson')) return 'chairperson';
    if (pathname.includes('voter')) return 'voter';
    if (pathname.includes('settings')) return 'settings';
    if (pathname.includes('admin')) return 'admin';
    return 'voter';
  };

  const baseMenuItems = [
    { id: 'voter', label: t.voter.dashboard, icon: Vote, href: '/voter' },
  ];
  
  const chairpersonMenuItems = [
    { id: 'chairperson', label: t.chairperson.dashboard, icon: Users, href: '/chairperson' },
  ];
  
  const additionalMenuItems = [
    { id: 'settings', label: t.settings.title, icon: Settings, href: '/settings' },
  ];
  
  const menuItems = [
    ...(roles?.includes('chairperson') ? chairpersonMenuItems : []),
    ...baseMenuItems,
    ...additionalMenuItems,
  ];

  if (isLoadingFactory) {
    return (
      <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <Vote className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">{t.common.loading}</span>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <Vote className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">{t.ballot.title}</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = getCurrentPage() === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={disconnect}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t.common.disconnect}
          </button>
        </div>
      </div>
    </aside>
  );
}