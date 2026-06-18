'use client';

import { Settings, Wallet, Bell, Shield } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/context/WalletContext';
import { formatAddress } from '@/lib/helpers';
import { translations } from '@/lib/i18n';

const t = translations;

export default function SettingsPage() {
  const { account, disconnect } = useWallet();

  const settingsSections = [
    {
      icon: Wallet,
      title: t.settings.wallet,
      description: t.settings.manageAccount,
      action: t.common.disconnect,
      actionVariant: 'outline',
      onClick: disconnect,
    },
    {
      icon: Bell,
      title: t.settings.notifications,
      description: t.settings.configure,
      action: t.settings.configure,
      actionVariant: 'outline',
      onClick: () => {},
    },
    {
      icon: Shield,
      title: t.settings.security,
      description: t.settings.configure,
      action: t.settings.view,
      actionVariant: 'outline',
      onClick: () => {},
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.settings.title}</h1>
        <p className="text-gray-600 mt-1">{t.settings.manageAccount}</p>
      </div>

      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{t.settings.connectedWallet}</h3>
            <p className="text-gray-600 mt-1">{formatAddress(account)}</p>
          </div>
          <Button variant="outline" onClick={disconnect}>
            {t.common.disconnect}
          </Button>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} hover>
              <CardBody className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
                <Button variant={section.actionVariant} onClick={section.onClick}>
                  {section.action}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}