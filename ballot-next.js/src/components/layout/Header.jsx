'use client';

import { Vote, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { WalletButton } from '@/components/ui/WalletButton';
import { NetworkSelector } from '@/components/ui/NetworkSelector';
import { translations } from '@/lib/i18n';

const t = translations;

export function Header({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.ballots, href: '/ballots' },
  ];
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Vote className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">{t.nav.appName}</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <NetworkSelector />
            <WalletButton />
            
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
      
      {children}
    </header>
  );
}