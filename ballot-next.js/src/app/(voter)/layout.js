'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { translations } from '@/lib/i18n';
import { useRequireAuth } from '@/hooks/useAuth';

const t = translations;

export default function VoterLayout({ children }) {
  const { mounted, isAuthenticated } = useRequireAuth();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">{t.common.connectFirst}</p>
        </div>
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}