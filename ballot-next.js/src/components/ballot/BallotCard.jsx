import { Vote, Users, TrendingUp } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatAddress } from '@/lib/helpers';
import { translations } from '@/lib/i18n';

const t = translations;

export function BallotCard({ ballot, onClick }) {
  const totalVotes = ballot.proposals?.reduce((sum, p) => sum + p.voteCount, 0) || 0;
  
  return (
    <Card hover onClick={onClick} className="h-full">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {ballot.description}
          </h3>
          <Badge variant="primary">
            {ballot.proposals?.length || 0} {t.ballot.proposals}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-500">
          {t.ballot.createdBy}: {formatAddress(ballot.creator)}
        </p>
        
        <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{totalVotes} {t.ballot.votes}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{ballot.proposals?.length || 0} {t.ballot.options}</span>
          </div>
        </div>
        
        {ballot.winner && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              {t.results.winningProposal}: {ballot.winner.name}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}