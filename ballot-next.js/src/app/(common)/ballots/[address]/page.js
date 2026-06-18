'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Vote, Users, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { VotePanel } from '@/components/ballot/VotePanel';
import { DelegationForm } from '@/components/ballot/DelegationForm';
import { ResultChart } from '@/components/ballot/ResultChart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { formatAddress } from '@/lib/helpers';
import { useWallet } from '@/context/WalletContext';
import { useBallot } from '@/hooks/useBallot';
import { translations } from '@/lib/i18n';
import { handleError } from '@/lib/errorHandler';

const t = translations;

export default function BallotDetailPage() {
  const { account } = useWallet();
  const params = useParams();
  const ballotAddress = params.address;
  const router = useRouter();
  
  const { proposals, voterInfo, chairperson, results, isLoading, error, vote, delegate } = useBallot(ballotAddress);
  const [activeTab, setActiveTab] = useState('vote');
  
  const totalVotes = results?.totalVotes || 0;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.common.error}</h3>
        <p className="text-gray-600">{handleError(error)}</p>
      </div>
    );
  }
  
  const isChairperson = account?.toLowerCase() === chairperson?.toLowerCase();
  const hasVotingRights = voterInfo?.weight > 0;
  const isVoted = voterInfo?.voted && !voterInfo?.delegate;
  const isDelegated = voterInfo?.voted && voterInfo?.delegate;
  
  // 是否可以委托：需要有投票权、未投票、voterInfo已加载
  const canDelegate = voterInfo && hasVotingRights && !isVoted && !isDelegated;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.common.back}
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardBody className="text-center py-8">
          <Vote className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.ballot.ballotDetails}</h1>
          <p className="text-gray-600">{formatAddress(ballotAddress)}</p>
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{proposals?.length || 0}</p>
              <p className="text-sm text-gray-600">{t.ballot.proposals}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Vote className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
              <p className="text-sm text-gray-600">{t.ballot.totalVotes}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {results?.winner?.name || '-'}
              </p>
              <p className="text-sm text-gray-600">{t.ballot.winner}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'vote' ? 'default' : 'outline'}
          onClick={() => setActiveTab('vote')}
          disabled={!hasVotingRights || isVoted}
        >
          <Vote className="w-4 h-4 mr-2" />
          {t.vote.title}
        </Button>
        <Button
          variant={activeTab === 'delegate' ? 'default' : 'outline'}
          onClick={() => setActiveTab('delegate')}
          disabled={!canDelegate}
        >
          <Users className="w-4 h-4 mr-2" />
          {t.delegation.title}
        </Button>
        <Button
          variant={activeTab === 'results' ? 'default' : 'outline'}
          onClick={() => setActiveTab('results')}
        >
          <Trophy className="w-4 h-4 mr-2" />
          {t.results.title}
        </Button>
      </div>
      
      <Card>
        <CardBody>
          {activeTab === 'vote' && (
            <VotePanel 
              proposals={proposals} 
              voterInfo={voterInfo}
              onVote={vote}
              isChairperson={isChairperson}
            />
          )}
          
          {activeTab === 'delegate' && (
            <DelegationForm 
              voterInfo={voterInfo}
              onDelegate={delegate}
            />
          )}
          
          {activeTab === 'results' && (
            <ResultChart 
              proposals={proposals}
              totalVotes={totalVotes}
              winnerIndex={results?.winnerIndex}
            />
          )}
        </CardBody>
      </Card>
      
      {isChairperson && (
        <Card className="mt-6">
          <CardBody>
            <Badge variant="secondary" className="mb-4">
              {t.chairperson.dashboard}
            </Badge>
            <p className="text-gray-600">
              {t.chairperson.asChairperson}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push(`/chairperson/manage/${ballotAddress}`)}
            >
              {t.chairperson.manageBallot}
            </Button>
          </CardBody>
        </Card>
      )}
      
      {!hasVotingRights && !isChairperson && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardBody>
            <AlertCircle className="w-5 h-5 text-yellow-600 inline-block mr-2" />
            <span className="text-yellow-800">
              {t.vote.noVotingRights} {t.vote.contactChairperson}
            </span>
          </CardBody>
        </Card>
      )}
    </div>
  );
}