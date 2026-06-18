import { getBallotFactoryContract } from '@/lib/web3/contracts';
import { callContract, sendTransaction } from '@/lib/web3/utils';
import { toNumber, formatBytes32String } from '@/lib/helpers';

export function createFactoryService(provider) {
  return {
    async createBallot(proposalNames, description, signer) {
      const contract = getBallotFactoryContract(signer);
      const encodedNames = proposalNames.map(name => formatBytes32String(name));
      return sendTransaction(contract, 'createBallot', encodedNames, description);
    },

    async getBallotCount() {
      const contract = getBallotFactoryContract(provider);
      const result = await callContract(contract, 'getBallotCount');
      
      if (result.success) {
        return toNumber(result.data);
      }
      throw new Error(result.error);
    },

    async getBallot(index) {
      const contract = getBallotFactoryContract(provider);
      const result = await callContract(contract, 'getBallot', index);
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    async getAllBallots() {
      const contract = getBallotFactoryContract(provider);
      const result = await callContract(contract, 'getAllBallots');
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    async getBallotInfo(index) {
      const contract = getBallotFactoryContract(provider);
      const result = await callContract(contract, 'getBallotInfo', index);
      
      if (result.success) {
        return {
          ballotAddress: result.data[0],
          description: result.data[1],
          creator: result.data[2],
        };
      }
      throw new Error(result.error);
    },

    async getBallotDescription(ballotAddress) {
      const contract = getBallotFactoryContract(provider);
      const result = await callContract(contract, 'getBallotDescription', ballotAddress);
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    async getBallotCreator(ballotAddress) {
      const contract = getBallotFactoryContract(provider);
      const result = await callContract(contract, 'getBallotCreator', ballotAddress);
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    async getAllBallotsWithInfo() {
      const count = await this.getBallotCount();
      const ballots = [];
      
      for (let i = 0; i < count; i++) {
        const info = await this.getBallotInfo(i);
        ballots.push(info);
      }
      
      return ballots;
    },

    async getBallotsByCreator(creatorAddress) {
      const allBallots = await this.getAllBallotsWithInfo();
      return allBallots.filter(ballot => ballot.creator.toLowerCase() === creatorAddress.toLowerCase());
    },
  };
}