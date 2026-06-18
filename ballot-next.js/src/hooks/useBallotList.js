import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { createFactoryService } from '@/data/factoryService';
import { createBallotService } from '@/data/ballotService';
import { handleError } from '@/lib/errorHandler';
import { NETWORK_CONFIGS, DEFAULT_CHAIN_ID } from '@/lib/constants';

export function useBallotList(provider, account = null) {
  const [ballots, setBallots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const factoryServiceRef = useRef(null);
  const ballotServiceRef = useRef(null);
  const readOnlyProviderRef = useRef(null);

  // 获取只读 provider（用于未连接钱包时访问公共数据）
  const getReadOnlyProvider = useCallback(() => {
    if (readOnlyProviderRef.current) {
      return readOnlyProviderRef.current;
    }
    
    const networkConfig = NETWORK_CONFIGS[DEFAULT_CHAIN_ID];
    if (networkConfig) {
      readOnlyProviderRef.current = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    }
    
    return readOnlyProviderRef.current;
  }, []);

  useEffect(() => {
    // 使用传入的 provider 或只读 provider
    const activeProvider = provider || getReadOnlyProvider();
    
    if (activeProvider) {
      factoryServiceRef.current = createFactoryService(activeProvider);
      ballotServiceRef.current = createBallotService(activeProvider);
    }
  }, [provider, getReadOnlyProvider]);

  const loadBallots = useCallback(async () => {
    if (!factoryServiceRef.current || !ballotServiceRef.current) {
      // 尝试初始化服务
      const activeProvider = provider || getReadOnlyProvider();
      if (activeProvider) {
        factoryServiceRef.current = createFactoryService(activeProvider);
        ballotServiceRef.current = createBallotService(activeProvider);
      } else {
        setError(handleError(new Error('Provider not available')));
        return [];
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const ballotAddresses = await factoryServiceRef.current.getAllBallots();
      
      // 处理空结果
      if (!ballotAddresses || !Array.isArray(ballotAddresses) || ballotAddresses.length === 0) {
        setBallots([]);
        return [];
      }
      
      const ballotDetails = await Promise.all(
        ballotAddresses.map(async (address) => {
          const promises = [
            factoryServiceRef.current.getBallotDescription(address),
            factoryServiceRef.current.getBallotCreator(address),
            ballotServiceRef.current.getProposals(address),
            ballotServiceRef.current.getResults(address),
          ];
          
          if (account) {
            promises.push(ballotServiceRef.current.getVoter(address, account));
          }
          
          const [description, creator, proposals, results, voterInfo] = await Promise.all(promises);
          
          return {
            address,
            description,
            creator,
            proposals,
            totalVotes: results?.totalVotes || 0,
            winner: results?.winner,
            voterInfo: account ? voterInfo : null,
          };
        })
      );
      
      setBallots(ballotDetails);
      return ballotDetails;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [account, provider, getReadOnlyProvider]);

  const refresh = useCallback(() => {
    loadBallots();
  }, [loadBallots]);

  useEffect(() => {
    loadBallots();
  }, [loadBallots]);

  return {
    ballots,
    isLoading,
    error,
    refresh,
  };
}