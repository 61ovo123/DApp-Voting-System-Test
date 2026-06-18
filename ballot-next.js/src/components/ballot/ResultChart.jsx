import { Trophy, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { calculatePercentage } from '@/lib/helpers';
import { translations } from '@/lib/i18n';

const t = translations;

export function ResultChart({ proposals, totalVotes, winnerIndex }) {
  if (!proposals || proposals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{t.results.noResults}</p>
      </div>
    );
  }
  
  const winner = proposals[winnerIndex];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          <BarChart3 className="w-6 h-6 inline-block mr-2" />
          {t.results.title}
        </h2>
        <Badge variant="primary">
          {t.common.total}: {totalVotes} {t.ballot.votes}
        </Badge>
      </div>
      
      {winner && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-600">{t.results.winningProposal}</p>
            <p className="font-bold text-gray-900">{winner.name}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {proposals.map((proposal, index) => {
          const percentage = calculatePercentage(proposal.voteCount, totalVotes);
          const isWinner = index === winnerIndex;
          
          return (
            <div key={proposal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isWinner && <Trophy className="w-4 h-4 text-yellow-500" />}
                  <span className={`font-medium ${isWinner ? 'text-yellow-700' : 'text-gray-900'}`}>
                    {proposal.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {proposal.voteCount} ({percentage}%)
                </span>
              </div>
              <Progress value={proposal.voteCount} max={totalVotes} showLabel={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}