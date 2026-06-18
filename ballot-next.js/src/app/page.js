'use client';

import { Vote, TrendingUp, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { BallotCard } from '@/components/ballot/BallotCard';
import { useBallotList } from '@/hooks/useBallotList';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { translations } from '@/lib/i18n';
import { handleError } from '@/lib/errorHandler';

const t = translations;

export default function Home() {
  const { provider } = useWallet();
  const { ballots, isLoading, error } = useBallotList(provider);
  const router = useRouter();
  
  const stats = [
    { label: t.ballot.activeBallots, value: ballots.length, icon: Vote },
    { label: t.ballot.totalVotes2, value: ballots.reduce((sum, b) => sum + b.totalVotes, 0), icon: TrendingUp },
    { label: t.ballot.proposal2, value: ballots.reduce((sum, b) => sum + b.proposals.length, 0), icon: Users },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.common.decentralizedVoting}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.common.secureVoting}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/ballots">
                {t.common.exploring}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/chairperson">
                {t.common.creating}
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
        
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">{t.common.latestBallots}</h2>
            <Button variant="ghost" asChild>
              <Link href="/ballots">
                {t.common.viewAll}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-gray-500">
              <Vote className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{handleError(error)}</p>
            </div>
          ) : ballots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Vote className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t.common.noBallotsCreated}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ballots.slice(0, 3).map((ballot) => (
                <BallotCard 
                  key={ballot.address} 
                  ballot={ballot} 
                  onClick={() => router.push(`/ballots/${ballot.address}`)}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}