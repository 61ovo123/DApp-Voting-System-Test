'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Vote, Users, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { BallotCard } from '@/components/ballot/BallotCard';
import { useWallet } from '@/context/WalletContext';
import { useFactory } from '@/hooks/useFactory';
import { createBallotService } from '@/data/ballotService';
import { translations } from '@/lib/i18n';
import { handleError } from '@/lib/errorHandler';

const t = translations;

export default function ChairpersonPage() {
  const { account, provider, signer } = useWallet();
  const { getBallotsByCreator, createBallot, getBallotDescription } = useFactory(provider);
  const ballotServiceRef = useRef(null);
  const router = useRouter();
  
  const [ballots, setBallots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [proposalNames, setProposalNames] = useState(['', '']);
  const [description, setDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (provider) {
      ballotServiceRef.current = createBallotService(provider);
    }
  }, [provider]);

  const loadBallots = async () => {
    if (!account || !ballotServiceRef.current) return;
    
    try {
      setIsLoading(true);
      const myBallots = await getBallotsByCreator(account);
      
      const detailedBallots = await Promise.all(
        myBallots.map(async (ballot) => {
          const [proposals, results] = await Promise.all([
            ballotServiceRef.current.getProposals(ballot.ballotAddress),
            ballotServiceRef.current.getResults(ballot.ballotAddress),
          ]);
          
          return {
            address: ballot.ballotAddress,
            description: ballot.description,
            creator: ballot.creator,
            proposals,
            totalVotes: results.totalVotes,
            winner: results.winner,
          };
        })
      );
      
      setBallots(detailedBallots);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadBallots();
  }, [account, provider]);
  
  const handleAddProposal = () => {
    setProposalNames([...proposalNames, '']);
  };
  
  const handleRemoveProposal = (index) => {
    if (proposalNames.length > 2) {
      setProposalNames(proposalNames.filter((_, i) => i !== index));
    }
  };
  
  const handleCreateBallot = async () => {
    if (!description.trim()) {
      setError(t.validation.enterDescription);
      return;
    }
    
    const validNames = proposalNames.filter(name => name.trim());
    if (validNames.length < 2) {
      setError(t.validation.enterProposals);
      return;
    }
    
    try {
      setCreateLoading(true);
      setError(null);
      
      const result = await createBallot(validNames, description, signer);
      
      if (result.success) {
        setShowCreateModal(false);
        setProposalNames(['', '']);
        setDescription('');
        await loadBallots();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(handleError(err));
    } finally {
      setCreateLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.chairperson.dashboard}</h1>
          <p className="text-gray-600 mt-1">{t.chairperson.createAndManage}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t.ballot.createBallot}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Vote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ballots.length}</p>
              <p className="text-sm text-gray-600">{t.chairperson.yourBallots}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {ballots.reduce((sum, b) => sum + b.proposals.length, 0)}
              </p>
              <p className="text-sm text-gray-600">{t.chairperson.totalProposals}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {ballots.reduce((sum, b) => sum + b.totalVotes, 0)}
              </p>
              <p className="text-sm text-gray-600">{t.chairperson.totalVotesReceived}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.chairperson.yourBallots}</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : ballots.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Vote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.ballot.noBallots}</h3>
              <p className="text-gray-600 mb-4">{t.chairperson.createAndManage}</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.ballot.createBallot}
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ballots.map((ballot) => (
              <BallotCard 
                key={ballot.address} 
                ballot={ballot} 
                onClick={() => router.push(`/chairperson/manage/${ballot.address}`)}
              />
            ))}
          </div>
        )}
      </div>
      
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => {
          setShowCreateModal(false);
          setError(null);
        }}
        title={t.ballot.createBallot}
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.ballot.description}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入投票描述"
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.ballot.proposals}</label>
            <div className="space-y-2">
              {proposalNames.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => {
                      const newNames = [...proposalNames];
                      newNames[index] = e.target.value;
                      setProposalNames(newNames);
                    }}
                    placeholder={`提案 ${index + 1}`}
                  />
                  {proposalNames.length > 2 && (
                    <button
                      onClick={() => handleRemoveProposal(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {t.ballot.removeProposal}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddProposal}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + {t.ballot.addProposal}
            </button>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setError(null);
              }}
            >
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateBallot} disabled={createLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                t.ballot.createBallot
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}