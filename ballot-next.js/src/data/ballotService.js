import { getBallotContract } from '@/lib/web3/contracts';
import { callContract, sendTransaction } from '@/lib/web3/utils';
import { parseBytes32String, toNumber } from '@/lib/helpers';

export function createBallotService(provider) {
  return {
    async getChairperson(ballotAddress) {
      const contract = getBallotContract(ballotAddress, provider);
      const result = await callContract(contract, 'chairperson');
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    async getProposals(ballotAddress) {
      const contract = getBallotContract(ballotAddress, provider);
      
      const proposals = [];
      let i = 0;
      
      while (true) {
        try {
          const result = await callContract(contract, 'proposals', i);
          
          if (result.success) {
            const name = parseBytes32String(result.data[0]);
            if (!name) break;
            
            proposals.push({
              id: i,
              name,
              voteCount: toNumber(result.data[1]),
            });
            i++;
          } else {
            break;
          }
        } catch {
          break;
        }
      }
      
      return proposals;
    },

    async getVoter(ballotAddress, voterAddress) {
      const contract = getBallotContract(ballotAddress, provider);
      const result = await callContract(contract, 'voters', voterAddress);
      
      if (result.success) {
        return {
          address: voterAddress,
          weight: toNumber(result.data[0]),
          voted: result.data[1],
          delegate: result.data[2] === '0x0000000000000000000000000000000000000000' ? null : result.data[2],
          vote: result.data[1] ? toNumber(result.data[3]) : undefined,
        };
      }
      throw new Error(result.error);
    },

    async vote(ballotAddress, proposalId, signer) {
      const contract = getBallotContract(ballotAddress, signer);
      return sendTransaction(contract, 'vote', proposalId);
    },

    async delegate(ballotAddress, delegateTo, signer) {
      const contract = getBallotContract(ballotAddress, signer);
      return sendTransaction(contract, 'delegate', delegateTo);
    },

    async giveRightToVote(ballotAddress, voterAddress, signer) {
      const contract = getBallotContract(ballotAddress, signer);
      return sendTransaction(contract, 'giveRightToVote', voterAddress);
    },

    async winningProposal(ballotAddress) {
      const contract = getBallotContract(ballotAddress, provider);
      const result = await callContract(contract, 'winningProposal');
      
      if (result.success) {
        return toNumber(result.data);
      }
      throw new Error(result.error);
    },

    async winnerName(ballotAddress) {
      const contract = getBallotContract(ballotAddress, provider);
      const result = await callContract(contract, 'winnerName');
      
      if (result.success) {
        return parseBytes32String(result.data);
      }
      throw new Error(result.error);
    },

    async getResults(ballotAddress) {
      const proposals = await this.getProposals(ballotAddress);
      const totalVotes = proposals.reduce((sum, p) => sum + p.voteCount, 0);
      const winnerIndex = await this.winningProposal(ballotAddress);
      
      return {
        proposals,
        totalVotes,
        winner: proposals[winnerIndex],
        winnerIndex,
      };
    },

    async getUserVoteStatus(ballotAddress, userAddress) {
      const voter = await this.getVoter(ballotAddress, userAddress);
      
      if (voter.weight === 0) {
        return 'no_right';
      }
      
      if (voter.voted && voter.delegate) {
        return 'delegated';
      }
      
      if (voter.voted) {
        return 'voted';
      }
      
      return 'can_vote';
    },
  };
}