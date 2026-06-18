'use client';

import { useState, useEffect } from 'react';
import { Vote, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProposalList } from '@/components/ballot/ProposalList';
import { Badge } from '@/components/ui/Badge';
import { translations } from '@/lib/i18n';

const t = translations;

export function VotePanel({ 
  proposals, 
  totalVotes, 
  voterInfo: externalVoterInfo, 
  onVote,
  isChairperson
}) {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const actualVoterInfo = externalVoterInfo;
  const actualError = localError;
  
  const canVote = actualVoterInfo?.weight > 0 && !actualVoterInfo?.voted;
  const hasVoted = actualVoterInfo?.voted && !actualVoterInfo?.delegate;
  const hasDelegated = actualVoterInfo?.voted && actualVoterInfo?.delegate;
  
  const handleVote = async () => {
    if (selectedProposal === null || !onVote) return;
    
    try {
      setLocalError(null);
      setIsVoting(true);
      const result = await onVote(selectedProposal);
      
      if (result.success) {
        setVoteSuccess(true);
        setTimeout(() => setVoteSuccess(false), 3000);
        setSelectedProposal(null);
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    if (voteSuccess) {
      setSelectedProposal(null);
    }
  }, [voteSuccess]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          <Vote className="w-6 h-6 inline-block mr-2" />
          {t.vote.title}
        </h2>
        
        {hasVoted && (
          <Badge variant="success">{t.voter.voted}</Badge>
        )}
        
        {hasDelegated && (
          <Badge variant="warning">{t.voter.delegated}</Badge>
        )}
        
        {!canVote && !hasVoted && !hasDelegated && actualVoterInfo && (
          <Badge variant="danger">{t.vote.noVotingRights}</Badge>
        )}
      </div>
      
      {actualError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700">{actualError}</span>
        </div>
      )}

      {voteSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-700">{t.vote.voteSuccess}</span>
        </div>
      )}
      
      {actualVoterInfo && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          {t.vote.title}: <span className="font-semibold text-gray-900">{actualVoterInfo.weight}</span>
        </div>
      )}
      
      <ProposalList 
        proposals={proposals}
        totalVotes={totalVotes}
        selectedId={selectedProposal}
        onSelect={canVote ? setSelectedProposal : undefined}
      />
      
      {canVote && (
        <Button 
          onClick={handleVote}
          disabled={selectedProposal === null || isVoting}
          loading={isVoting}
          className="w-full"
        >
          {selectedProposal === null ? t.vote.selectProposal : t.vote.confirmVote}
        </Button>
      )}
      
      {hasVoted && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-700">
            {t.voter.votedFor}: {proposals?.find(p => p.id === actualVoterInfo?.vote)?.name || 'Unknown'}
          </span>
        </div>
      )}
      
      {hasDelegated && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Vote className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-yellow-700">
            {t.delegation.alreadyDelegated}
          </span>
        </div>
      )}
      
      {!canVote && !hasVoted && !hasDelegated && !isChairperson && actualVoterInfo && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            {t.vote.noVotingRights} {t.vote.contactChairperson}
          </span>
        </div>
      )}
    </div>
  );
}