'use client';

import { Settings, Users, Database, Activity } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { translations } from '@/lib/i18n';

const t = translations;

export default function AdminPage() {
  const stats = [
    { label: t.admin.totalBallots, value: '0', icon: Database },
    { label: t.ballot.totalVotes, value: '0', icon: Activity },
    { label: t.admin.activeUsers, value: '0', icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.admin.dashboard}</h1>
        <p className="text-gray-600 mt-1">{t.admin.manageSystem}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardBody className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardBody className="p-8 text-center">
          <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.admin.dashboard}</h3>
          <p className="text-gray-600">
            {t.admin.underDevelopment}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}