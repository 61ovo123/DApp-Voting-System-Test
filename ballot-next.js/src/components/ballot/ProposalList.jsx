import { BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';
import { calculatePercentage } from '@/lib/helpers';
import { translations } from '@/lib/i18n';

const t = translations;

export function ProposalList({ proposals, totalVotes = 0, selectedId, onSelect }) {
  if (!proposals || proposals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{t.ballot.noBallots}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {proposals.map((proposal) => {
        const percentage = calculatePercentage(proposal.voteCount, totalVotes);
        
        return (
          <div
            key={proposal.id}
            onClick={() => onSelect?.(proposal.id)}
            className={`relative p-4 rounded-lg border transition-all ${
              selectedId === proposal.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${onSelect ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{proposal.name}</span>
              <span className="text-sm font-semibold text-gray-700">
                {proposal.voteCount} {t.ballot.votes} ({percentage}%)
              </span>
            </div>
            <Progress value={proposal.voteCount} max={totalVotes} showLabel={false} />
          </div>
        );
      })}
    </div>
  );
}