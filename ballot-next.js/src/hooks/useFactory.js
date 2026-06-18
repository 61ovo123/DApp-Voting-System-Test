import { useState, useCallback, useEffect, useRef } from 'react';
import { createFactoryService } from '@/data/factoryService';
import { handleError } from '@/lib/errorHandler';

export function useFactory(provider) {
  const [ballots, setBallots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const factoryServiceRef = useRef(null);

  useEffect(() => {
    if (provider) {
      factoryServiceRef.current = createFactoryService(provider);
    }
  }, [provider]);

  const loadBallots = useCallback(async () => {
    if (!factoryServiceRef.current) {
      setError(handleError(new Error('Provider not available')));
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const allBallots = await factoryServiceRef.current.getAllBallotsWithInfo();
      setBallots(allBallots);
      return allBallots;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBallot = useCallback(async (proposalNames, description, signer) => {
    if (!factoryServiceRef.current) {
      const errorMsg = handleError(new Error('Provider not available'));
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await factoryServiceRef.current.createBallot(proposalNames, description, signer);
      
      if (result.success) {
        await loadBallots();
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadBallots]);

  const getBallotInfo = useCallback(async (index) => {
    if (!factoryServiceRef.current) {
      const errorMsg = handleError(new Error('Provider not available'));
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      return await factoryServiceRef.current.getBallotInfo(index);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw err;
    }
  }, []);

  const getBallotDescription = useCallback(async (ballotAddress) => {
    if (!factoryServiceRef.current) {
      const errorMsg = handleError(new Error('Provider not available'));
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      return await factoryServiceRef.current.getBallotDescription(ballotAddress);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw err;
    }
  }, []);

  const getBallotCreator = useCallback(async (ballotAddress) => {
    if (!factoryServiceRef.current) {
      const errorMsg = handleError(new Error('Provider not available'));
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      return await factoryServiceRef.current.getBallotCreator(ballotAddress);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw err;
    }
  }, []);

  const getBallotsByCreator = useCallback(async (creatorAddress) => {
    if (!factoryServiceRef.current) {
      const errorMsg = handleError(new Error('Provider not available'));
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      return await factoryServiceRef.current.getBallotsByCreator(creatorAddress);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (provider) {
      loadBallots();
    }
  }, [provider, loadBallots]);

  return {
    ballots,
    isLoading,
    error,
    loadBallots,
    createBallot,
    getBallotInfo,
    getBallotDescription,
    getBallotCreator,
    getBallotsByCreator,
  };
}