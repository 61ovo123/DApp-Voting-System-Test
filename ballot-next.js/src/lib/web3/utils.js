import { ethers } from 'ethers';
import { getErrorMessage } from '@/lib/helpers';
import { NETWORK_CONFIGS } from '@/lib/constants';

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('请安装 MetaMask 钱包插件');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('用户拒绝了连接请求');
    }
    throw new Error(getErrorMessage(error));
  }
}

export function getProvider() {
  if (!window.ethereum) {
    return null;
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(provider) {
  try {
    return await provider.getSigner();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getChainId(provider) {
  try {
    const network = await provider.getNetwork();
    return network.chainId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function switchNetwork(chainId) {
  if (!window.ethereum) {
    throw new Error('请安装 MetaMask 钱包插件');
  }

  try {
    // 尝试切换网络
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error) {
    // 如果网络不存在，尝试添加网络
    if (error.code === 4902) {
      const networkConfig = NETWORK_CONFIGS[chainId];
      if (!networkConfig) {
        throw new Error(`不支持的网络 ID: ${chainId}`);
      }

      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: networkConfig.chainName,
            nativeCurrency: networkConfig.nativeCurrency,
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: networkConfig.blockExplorerUrls,
          }],
        });
      } catch (addError) {
        throw new Error(`添加网络失败: ${addError.message}`);
      }
    } else if (error.code === -32002) {
      throw new Error('请在 MetaMask 中完成请求');
    } else {
      throw new Error(getErrorMessage(error));
    }
  }
}

export function createContract(address, abi, signerOrProvider) {
  return new ethers.Contract(address, abi, signerOrProvider);
}

export async function sendTransaction(contract, methodName, ...args) {
  try {
    if (!contract) {
      return {
        success: false,
        error: 'Contract instance is undefined',
      };
    }

    if (typeof contract[methodName] !== 'function') {
      return {
        success: false,
        error: `Method "${methodName}" not found on contract`,
      };
    }

    const tx = await contract[methodName](...args);
    const receipt = await tx.wait();
    return {
      success: true,
      hash: receipt.hash,
      receipt,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function callContract(contract, methodName, ...args) {
  try {
    if (!contract) {
      return {
        success: false,
        error: '合约实例未定义',
      };
    }

    if (typeof contract[methodName] !== 'function') {
      return {
        success: false,
        error: `方法 "${methodName}" 在合约中不存在`,
      };
    }

    const result = await contract[methodName](...args);
    
    // 处理空结果
    if (result === '0x' || result === null || result === undefined) {
      return {
        success: true,
        data: null,
      };
    }
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // 特殊处理 "could not decode" 错误
    if (error.code === 'BAD_DATA' || error.message?.includes('could not decode')) {
      return {
        success: false,
        error: '合约返回数据格式错误，请检查合约地址是否正确',
      };
    }
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export function listenForEvent(contract, eventName, callback) {
  contract.on(eventName, (...args) => {
    callback(args);
  });
  
  return () => {
    contract.removeListener(eventName, callback);
  };
}