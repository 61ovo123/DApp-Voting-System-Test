'use client';

import { useRouter } from 'next/navigation';
import { Vote, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatAddress } from '@/lib/helpers';
import { useWallet } from '@/context/WalletContext';
import { useBallotList } from '@/hooks/useBallotList';
import { translations } from '@/lib/i18n';

const t = translations;

export default function VoterPage() {
  const { account, provider } = useWallet();
  const { ballots, isLoading } = useBallotList(provider, account);
  const router = useRouter();
  
  const getVoteStatus = (voterInfo) => {
    if (!voterInfo) return { status: 'unknown', label: t.voter.unknown };
    if (voterInfo.weight === 0) return { status: 'no_right', label: t.voter.noRights };
    if (voterInfo.voted && voterInfo.delegate) return { status: 'delegated', label: t.voter.delegated };
    if (voterInfo.voted) return { status: 'voted', label: t.voter.voted };
    return { status: 'can_vote', label: t.voter.canVote };
  };
  
  const statusColors = {
    unknown: 'default',
    no_right: 'danger',
    delegated: 'warning',
    voted: 'success',
    can_vote: 'primary',
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.voter.dashboard}</h1>
        <p className="text-gray-600 mt-1">{t.voter.viewParticipate}</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : ballots.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Vote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.ballot.noBallots}</h3>
            <p className="text-gray-600">{t.voter.viewParticipate}</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ballots.map((ballot) => {
            const voteStatus = getVoteStatus(ballot.voterInfo);
            
            return (
              <Card key={ballot.address} hover onClick={() => router.push(`/ballots/${ballot.address}`)}>
                <CardBody className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {ballot.description}
                    </h3>
                    <Badge variant={statusColors[voteStatus.status]}>
                      {voteStatus.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    {t.ballot.createdBy}: {formatAddress(ballot.creator)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {ballot.proposals?.length || 0} {t.ballot.options}
                    </span>
                    <span className="text-gray-600">
                      {ballot.totalVotes} {t.ballot.votes}
                    </span>
                  </div>
                  
                  {voteStatus.status === 'voted' && ballot.voterInfo?.vote !== undefined && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700">
                        {t.voter.votedFor}: {ballot.proposals?.find(p => p.id === ballot.voterInfo.vote)?.name}
                      </span>
                    </div>
                  )}
                  
                  {voteStatus.status === 'can_vote' && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-700">{t.voter.youCanVote}</span>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}