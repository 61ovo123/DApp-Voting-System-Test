'use client';

import { useState } from 'react';
import { Vote, Search, Filter, Loader2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { BallotCard } from '@/components/ballot/BallotCard';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/context/WalletContext';
import { useBallotList } from '@/hooks/useBallotList';
import { useRouter } from 'next/navigation';
import { translations } from '@/lib/i18n';
import { handleError } from '@/lib/errorHandler';

const t = translations;

export default function BallotsPage() {
  const { isConnected, connect } = useWallet();
  const { ballots, isLoading, error, refresh } = useBallotList(isConnected ? null : undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const router = useRouter();
  
  const filteredBallots = ballots.filter((ballot) =>
    ballot.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 排序逻辑
  const sortedBallots = [...filteredBallots].sort((a, b) => {
    if (sortBy === 'latest') {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    if (sortBy === 'votes') {
      return (b.totalVotes || 0) - (a.totalVotes || 0);
    }
    if (sortBy === 'proposals') {
      return (b.proposals?.length || 0) - (a.proposals?.length || 0);
    }
    return 0;
  });
  
  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      handleError(err);
    }
  };
  
  const handleRefresh = () => {
    refresh();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面头部 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.ballot.ballotList}</h1>
          <p className="text-gray-600 mt-1">
            {sortedBallots.length} {t.ballot.title} {t.common.total}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.common.search + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="latest">{t.common.latestBallots}</option>
            <option value="votes">{t.ballot.totalVotes}</option>
            <option value="proposals">{t.ballot.proposals}</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            {t.common.filter}
          </button>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-sm text-blue-600 mb-1">{t.ballot.activeBallots}</div>
          <div className="text-2xl font-bold text-gray-900">{ballots.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-sm text-green-600 mb-1">{t.ballot.totalVotes}</div>
          <div className="text-2xl font-bold text-gray-900">
            {ballots.reduce((sum, b) => sum + (b.totalVotes || 0), 0)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-sm text-purple-600 mb-1">{t.ballot.proposals}</div>
          <div className="text-2xl font-bold text-gray-900">
            {ballots.reduce((sum, b) => sum + (b.proposals?.length || 0), 0)}
          </div>
        </div>
      </div>
      
      {/* 内容区域 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500">{t.common.loading}</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <AlertTriangle className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t.common.error}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{handleError(error)}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isConnected && (
              <Button onClick={handleConnect}>
                {t.common.connect}
              </Button>
            )}
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.common.refresh}
            </Button>
          </div>
        </div>
      ) : sortedBallots.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <Vote className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            {searchTerm ? t.ballot.noBallotsFound : t.ballot.noBallots}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? t.common.noBallotsMatch
              : t.common.beFirstCreator
            }
          </p>
          <Button asChild>
            <a href="/chairperson">
              {t.common.creating}
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBallots.map((ballot) => (
            <BallotCard 
              key={ballot.address} 
              ballot={ballot} 
              onClick={() => router.push(`/ballots/${ballot.address}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}