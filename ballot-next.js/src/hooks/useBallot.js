import { useState, useCallback, useEffect, useRef } from 'react';
import { createBallotService } from '@/data/ballotService';
import { useWallet } from '@/context/WalletContext';
import { handleError } from '@/lib/errorHandler';
import { getErrorMessage } from '@/lib/helpers';

export function useBallot(ballotAddress) {
  const { account, provider, signer } = useWallet();
  const [proposals, setProposals] = useState([]);
  const [voterInfo, setVoterInfo] = useState(null);
  const [chairperson, setChairperson] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const ballotServiceRef = useRef(null);

  useEffect(() => {
    if (provider) {
      ballotServiceRef.current = createBallotService(provider);
    }
  }, [provider]);

  const loadBallotData = useCallback(async () => {
    if (!ballotAddress || !ballotServiceRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.debug('[useBallot] Loading ballot data for:', ballotAddress);
      const [proposalsData, chairpersonData, voterData] = await Promise.all([
        ballotServiceRef.current.getProposals(ballotAddress),
        ballotServiceRef.current.getChairperson(ballotAddress),
        account ? ballotServiceRef.current.getVoter(ballotAddress, account) : null,
      ]);
      
      console.debug('[useBallot] Loaded data:', { proposalsData, chairpersonData, voterData });
      setProposals(proposalsData);
      setChairperson(chairpersonData);
      setVoterInfo(voterData);
    } catch (err) {
      console.error('[useBallot] Error loading ballot data:', err);
      const errorMsg = handleError(err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [ballotAddress, account]);

  const loadResults = useCallback(async () => {
    if (!ballotAddress || !ballotServiceRef.current) return;
    
    try {
      const resultsData = await ballotServiceRef.current.getResults(ballotAddress);
      setResults(resultsData);
      return resultsData;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw err;
    }
  }, [ballotAddress]);

  const vote = useCallback(async (proposalId) => {
    if (!ballotServiceRef.current) {
      const errorMsg = handleError(new Error('Provider not available'));
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    setIsLoading(true);
    setError(null);
    setTransactionStatus('pending');
    
    try {
      const result = await ballotServiceRef.current.vote(ballotAddress, proposalId, signer);
      
      if (result.success) {
        setTransactionStatus({ success: true, hash: result.hash });
        await loadBallotData();
        await loadResults();
      } else {
        setTransactionStatus({ success: false, error: result.error });
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      setTransactionStatus({ success: false, error: errorMsg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ballotAddress, loadBallotData, loadResults, signer]);

  const delegate = useCallback(async (delegateTo) => {
    // 验证委托地址
    if (!delegateTo || !/^0x[a-fA-F0-9]{40}$/.test(delegateTo)) {
      return { success: false, error: '请输入有效的以太坊地址' };
    }
    
    // 检查签名者是否存在
    if (!signer) {
      return { success: false, error: '请先连接钱包' };
    }
    
    // 检查服务是否可用
    if (!ballotServiceRef.current) {
      return { success: false, error: '网络连接异常，请稍后重试' };
    }
    
    // 再次从合约获取最新的 voterInfo，避免状态过期
    let currentVoterInfo = voterInfo;
    if (account) {
      try {
        currentVoterInfo = await ballotServiceRef.current.getVoter(ballotAddress, account);
      } catch (err) {
        // 如果刷新失败，尝试使用缓存的 voterInfo
      }
    }
    
    // 检查是否有权限委托
    if (!currentVoterInfo || currentVoterInfo.weight === 0) {
      return { success: false, error: '您还没有投票权，请联系投票主席获取投票权' };
    }
    
    if (currentVoterInfo.voted) {
      return { success: false, error: currentVoterInfo.delegate ? '您已经委托过投票权了' : '您已经投票了' };
    }
    
    // 检查是否委托给自己
    if (delegateTo.toLowerCase() === account?.toLowerCase()) {
      return { success: false, error: '不能委托给自己，请选择其他地址' };
    }
    
    // 检查被委托者是否有投票权（合约要求）
    let delegateeVoterInfo = null;
    try {
      delegateeVoterInfo = await ballotServiceRef.current.getVoter(ballotAddress, delegateTo);
    } catch (err) {
      return { success: false, error: '无法获取被委托者的投票信息，请检查网络' };
    }
    
    if (!delegateeVoterInfo || delegateeVoterInfo.weight < 1) {
      return { success: false, error: '被委托者没有投票权，请选择一个已获得投票权的地址' };
    }
    
    setIsLoading(true);
    setError(null);
    setTransactionStatus('pending');
    
    try {
      const result = await ballotServiceRef.current.delegate(ballotAddress, delegateTo, signer);
      
      if (result.success) {
        setTransactionStatus({ success: true, hash: result.hash });
        await loadBallotData();
      } else {
        // 提供更详细的错误信息
        let errorMsg = result.error;
        if (errorMsg.includes('estimateGas') || errorMsg.includes('missing revert data')) {
          errorMsg = `委托交易失败: ${errorMsg}. 可能原因: 网络不匹配、合约不存在或签名者无效`;
        }
        setTransactionStatus({ success: false, error: errorMsg });
        setError(errorMsg);
      }
      
      return result;
    } catch (err) {
      let errorMsg = getErrorMessage(err);
      // 提供更详细的错误信息
      if (err.message?.includes('estimateGas') || err.message?.includes('missing revert data')) {
        errorMsg = `委托交易失败: ${errorMsg}. 请检查：1) 当前网络是否正确 2) 合约地址是否有效 3) 钱包是否有足够的 Gas`;
      }
      setError(errorMsg);
      setTransactionStatus({ success: false, error: errorMsg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ballotAddress, loadBallotData, signer, voterInfo, account]);

  const giveRightToVote = useCallback(async (voterAddress) => {
    if (!ballotServiceRef.current) {
      const errorMsg = handleError(new Error('Provider not available'));
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    setIsLoading(true);
    setError(null);
    setTransactionStatus('pending');
    
    try {
      const result = await ballotServiceRef.current.giveRightToVote(ballotAddress, voterAddress, signer);
      
      if (result.success) {
        setTransactionStatus({ success: true, hash: result.hash });
      } else {
        setTransactionStatus({ success: false, error: result.error });
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      setTransactionStatus({ success: false, error: errorMsg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ballotAddress, signer]);

  useEffect(() => {
    loadBallotData();
    loadResults();
  }, [loadBallotData, loadResults]);

  const getUserVoteStatus = useCallback(() => {
    if (!voterInfo) return 'unknown';
    if (voterInfo.weight === 0) return 'no_right';
    if (voterInfo.voted && voterInfo.delegate) return 'delegated';
    if (voterInfo.voted) return 'voted';
    return 'can_vote';
  }, [voterInfo]);

  return {
    proposals,
    voterInfo,
    chairperson,
    results,
    isLoading,
    error,
    transactionStatus,
    vote,
    delegate,
    giveRightToVote,
    getUserVoteStatus,
    reload: loadBallotData,
  };
}