'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users, Vote, Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatAddress } from '@/lib/helpers';
import { useWallet } from '@/context/WalletContext';
import { useFactory } from '@/hooks/useFactory';
import { useBallot } from '@/hooks/useBallot';
import { translations } from '@/lib/i18n';
import { handleError } from '@/lib/errorHandler';

const t = translations;

export default function ManageBallotPage() {
  const { account, provider } = useWallet();
  const { getBallotDescription, getBallotCreator } = useFactory(provider);
  const router = useRouter();
  const params = useParams();
  const ballotAddress = params.id;
  
  const { 
    proposals, 
    chairperson, 
    isLoading, 
    error, 
    giveRightToVote 
  } = useBallot(ballotAddress);
  
  const [ballot, setBallot] = useState(null);
  const [grantAddress, setGrantAddress] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState(false);
  const [grantError, setGrantError] = useState(null);

  useEffect(() => {
    const loadBallotInfo = async () => {
      if (!ballotAddress) return;
      
      try {
        const [description, creator] = await Promise.all([
          getBallotDescription(ballotAddress),
          getBallotCreator(ballotAddress),
        ]);
        setBallot({ address: ballotAddress, description, creator });
      } catch (err) {
        handleError(err);
      }
    };
    
    loadBallotInfo();
  }, [ballotAddress, getBallotDescription, getBallotCreator]);
  
  const handleGrantRightToVote = async () => {
    if (!grantAddress.trim()) {
      setGrantError(t.validation.enterAddress);
      return;
    }
    
    try {
      setGrantLoading(true);
      setGrantError(null);
      
      const result = await giveRightToVote(grantAddress);
      
      if (result.success) {
        setGrantSuccess(true);
        setGrantAddress('');
        setTimeout(() => setGrantSuccess(false), 3000);
      } else {
        setGrantError(result.error);
      }
    } catch (err) {
      setGrantError(handleError(err));
    } finally {
      setGrantLoading(false);
    }
  };
  
  const isChairperson = account?.toLowerCase() === chairperson?.toLowerCase();
  
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
  
  if (!isChairperson) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.chairperson.accessDenied}</h3>
        <p className="text-gray-600">{t.chairperson.notChairperson}</p>
      </div>
    );
  }
  
  const totalVotes = proposals.reduce((sum, p) => sum + p.voteCount, 0);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.common.back}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.chairperson.manageBallot}</h1>
          <p className="text-gray-600 mt-1">
            {t.ballot.title}: {formatAddress(ballotAddress)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Vote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
              <p className="text-sm text-gray-600">{t.ballot.totalVotes}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{proposals.length}</p>
              <p className="text-sm text-gray-600">{t.ballot.proposals}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            <Users className="w-5 h-5 inline-block mr-2" />
            {t.chairperson.grantVotingRights}
          </h2>
          
          <p className="text-sm text-gray-600">
            {t.chairperson.asChairperson}
          </p>
          
          <div className="flex gap-4">
            <Input
              placeholder="0x..."
              value={grantAddress}
              onChange={(e) => setGrantAddress(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleGrantRightToVote}
              disabled={!grantAddress || grantLoading}
              loading={grantLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.chairperson.grantVotingRights}
            </Button>
          </div>
          
          {grantSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{t.chairperson.votingRightsGranted}</span>
            </div>
          )}
          
          {grantError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{grantError}</span>
            </div>
          )}
        </CardBody>
      </Card>
      
      <Card>
        <CardBody>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.ballot.proposals}</h2>
          
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{proposal.name}</h3>
                </div>
                <Badge variant="primary">
                  {proposal.voteCount} {t.ballot.votes}
                </Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}