import { ethers } from 'ethers';
import { createContract } from './utils';
import ballotFactoryAbi from '@/contracts/abi/BallotFactory.json';
import ballotAbi from '@/contracts/abi/Ballot.json';

// JSON 文件直接是数组，不需要 .abi 属性
export const BALLOT_FACTORY_ABI = Array.isArray(ballotFactoryAbi) ? ballotFactoryAbi : ballotFactoryAbi.abi;
export const BALLOT_ABI = Array.isArray(ballotAbi) ? ballotAbi : ballotAbi.abi;

// 从环境变量读取合约地址，移除空格
const rawAddress = process.env.NEXT_PUBLIC_BALLOT_FACTORY_ADDRESS || '';
export const BALLOT_FACTORY_ADDRESS = rawAddress.trim() || '0x12191E13F1c9A240E12b99a516B04d4E51C06D50';

console.log('合约地址:', BALLOT_FACTORY_ADDRESS);

export function getBallotFactoryContract(signerOrProvider) {
  if (!BALLOT_FACTORY_ABI || !Array.isArray(BALLOT_FACTORY_ABI)) {
    throw new Error('Ballot Factory ABI 未正确加载');
  }
  if (!BALLOT_FACTORY_ADDRESS || !ethers.isAddress(BALLOT_FACTORY_ADDRESS)) {
    throw new Error(`无效的合约地址: ${BALLOT_FACTORY_ADDRESS}`);
  }
  return createContract(BALLOT_FACTORY_ADDRESS, BALLOT_FACTORY_ABI, signerOrProvider);
}

export function getBallotContract(address, signerOrProvider) {
  if (!BALLOT_ABI || !Array.isArray(BALLOT_ABI)) {
    throw new Error('Ballot ABI 未正确加载');
  }
  if (!address || !ethers.isAddress(address)) {
    throw new Error(`无效的投票合约地址: ${address}`);
  }
  return createContract(address, BALLOT_ABI, signerOrProvider);
}