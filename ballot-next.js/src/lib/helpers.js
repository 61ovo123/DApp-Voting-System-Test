import { ethers } from 'ethers';

export function formatAddress(address, chars = 6) {
  if (!address) return '0x0000...';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatBytes32String(str) {
  return ethers.encodeBytes32String(str);
}

export function parseBytes32String(bytes32) {
  return ethers.decodeBytes32String(bytes32);
}

export function toNumber(value) {
  if (typeof value === 'number') {
    return value;
  } else if (value && typeof value.toNumber === 'function') {
    return value.toNumber();
  } else if (typeof value === 'bigint') {
    return Number(value);
  }
  return 0;
}

export function formatNumber(num, decimals = 0) {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getErrorMessage(error) {
  if (!error) {
    return 'Unknown error';
  }
  
  // 如果是字符串，直接返回
  if (typeof error === 'string') {
    return error;
  }
  
  // 处理标准错误对象
  if (error.message) {
    let message = error.message;
    
    // 解析 ethers 合约 revert 错误
    if (message.includes('reverted')) {
      // 尝试提取 revert 原因
      const reasonMatch = message.match(/reverted with reason string '([^']+)'/);
      if (reasonMatch) {
        return reasonMatch[1];
      }
      // 尝试提取自定义错误
      const customErrorMatch = message.match(/error\s+(\w+)/);
      if (customErrorMatch) {
        return `合约执行失败: ${customErrorMatch[1]}`;
      }
      return '交易被拒绝';
    }
    
    // 处理 estimateGas 错误
    if (message.includes('estimateGas') || message.includes('missing revert data')) {
      return '交易执行失败，请检查您的权限或网络状态';
    }
    
    // 处理用户拒绝
    if (message.includes('User denied') || error.code === 4001) {
      return '用户拒绝了交易';
    }
    
    // 处理网络错误
    if (message.includes('network') || message.includes('connection')) {
      return '网络连接异常，请检查网络';
    }
    
    // 移除冗长的错误前缀
    if (message.startsWith('Error: ')) {
      message = message.slice(7);
    }
    
    return message;
  }
  
  // 处理其他类型的错误对象
  if (error.error) {
    return getErrorMessage(error.error);
  }
  
  return 'Unknown error';
}

export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}