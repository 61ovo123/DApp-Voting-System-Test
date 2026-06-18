'use client';

import { useState } from 'react';
import { Users, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { translations } from '@/lib/i18n';

const t = translations;

export function DelegationForm({ voterInfo: externalVoterInfo, onDelegate }) {
  const [delegateAddress, setDelegateAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isDelegating, setIsDelegating] = useState(false);

  const actualVoterInfo = externalVoterInfo;
  const actualError = localError;
  
  // 检查是否可以委托
  const hasVotingRights = actualVoterInfo?.weight > 0;
  const hasVoted = actualVoterInfo?.voted;
  const canDelegate = hasVotingRights && !hasVoted;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!delegateAddress || !onDelegate) return;
    
    // 提交前再次验证
    if (!hasVotingRights) {
      setLocalError('您还没有投票权，请联系投票主席获取投票权');
      return;
    }
    
    if (hasVoted) {
      setLocalError('您已经投票或委托过了，无法再次委托');
      return;
    }
    
    // 验证地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(delegateAddress)) {
      setLocalError('请输入有效的以太坊地址');
      return;
    }
    
    try {
      setLocalError(null);
      setIsDelegating(true);
      const result = await onDelegate(delegateAddress);
      
      if (result?.success) {
        setSubmitted(true);
        setDelegateAddress('');
      } else {
        setLocalError(result?.error || '委托失败，请稍后重试');
      }
    } catch (err) {
      setLocalError(err.message || '委托过程中发生错误');
    } finally {
      setIsDelegating(false);
    }
  };
  
  // 显示权限不足的提示
  if (!actualVoterInfo) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-gray-700 font-medium">{t.common.loading}</p>
            <p className="text-sm text-gray-500">正在获取您的投票信息...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // 显示无法委托的原因
  if (!canDelegate) {
    let reason = '';
    let bgColor = 'bg-gray-50';
    
    if (!hasVotingRights) {
      reason = '您还没有投票权，请联系投票主席获取投票权';
      bgColor = 'bg-yellow-50';
    } else if (hasVoted) {
      reason = '您已经投票或委托过了';
      bgColor = 'bg-gray-50';
    }
    
    return (
      <div className={`p-6 ${bgColor} rounded-lg`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-gray-700 font-medium">{t.delegation.cannotDelegate}</p>
            <p className="text-sm text-gray-500 mt-1">{reason}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // 委托成功
  if (submitted) {
    return (
      <div className="flex items-center gap-3 p-6 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
        <div>
          <p className="text-green-700 font-medium">{t.delegation.delegateSuccess}</p>
          <p className="text-sm text-green-600 mt-1">您的投票权已成功委托给指定地址</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        <Users className="w-6 h-6 inline-block mr-2" />
        {t.delegation.title}
      </h2>
      
      <p className="text-sm text-gray-600">
        {t.delegation.delegateTo}
      </p>
      
      {/* 显示当前投票权信息 */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            您的投票权重: {actualVoterInfo?.weight || 0}
          </span>
        </div>
      </div>
      
      {/* 错误提示 */}
      {actualError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">委托失败</p>
            <p className="text-sm text-red-600 mt-1">{actualError}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.delegation.delegateTo}
          type="text"
          placeholder="0x..."
          value={delegateAddress}
          onChange={(e) => setDelegateAddress(e.target.value)}
          required
        />
        
        <Button 
          type="submit" 
          disabled={!delegateAddress || isDelegating}
          loading={isDelegating}
          className="w-full"
        >
          {t.delegation.delegateVote}
        </Button>
      </form>
    </div>
  );
}