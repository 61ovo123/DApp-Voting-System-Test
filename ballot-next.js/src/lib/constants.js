export const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  POLYGON: 137,
  MUMBAI: 80001,
  LOCAL: 1337,
};

// 从环境变量读取默认网络
export const DEFAULT_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) || CHAIN_IDS.SEPOLIA;

export const NETWORK_CONFIGS = {
  [CHAIN_IDS.MAINNET]: {
    chainId: CHAIN_IDS.MAINNET,
    chainName: 'Ethereum Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://etherscan.io'],
  },
  [CHAIN_IDS.SEPOLIA]: {
    chainId: CHAIN_IDS.SEPOLIA,
    chainName: 'Sepolia Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  [CHAIN_IDS.POLYGON]: {
    chainId: CHAIN_IDS.POLYGON,
    chainName: 'Polygon Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  [CHAIN_IDS.MUMBAI]: {
    chainId: CHAIN_IDS.MUMBAI,
    chainName: 'Polygon Mumbai',
    rpcUrl: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL || 'https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
  [CHAIN_IDS.LOCAL]: {
    chainId: CHAIN_IDS.LOCAL,
    chainName: 'Local Network',
    rpcUrl: process.env.NEXT_PUBLIC_LOCAL_RPC_URL || 'http://localhost:8545',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: [],
  },
};

export const BALLOT_STORAGE_KEYS = {
  WALLET_CONNECTED: 'ballot_wallet_connected',
  LAST_BALLOT: 'ballot_last_ballot',
  USER_PREFERENCES: 'ballot_user_preferences',
  SELECTED_NETWORK: 'ballot_selected_network',
};

export const BALLOT_ERRORS = {
  NO_VOTE_RIGHT: 'You have no right to vote',
  ALREADY_VOTED: 'Already voted',
  INVALID_PROPOSAL: 'Invalid proposal index',
  SELF_DELEGATION: 'Self-delegation is disallowed',
  DELEGATION_LOOP: 'Found loop in delegation',
  NO_RIGHT_TO_VOTE: 'Has no right to vote',
  ONLY_CHAIRPERSON: 'Only chairperson can give right to vote',
  VOTER_ALREADY_VOTED: 'The voter already voted',
  MIN_PROPOSALS: 'At least two proposals required',
  EMPTY_DESCRIPTION: 'Description cannot be empty',
  INDEX_OUT_OF_BOUNDS: 'Index out of bounds',
};

export const VOTE_STATUS = {
  NO_RIGHT: 'no_right',
  CAN_VOTE: 'can_vote',
  VOTED: 'voted',
  DELEGATED: 'delegated',
};