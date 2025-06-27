import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism, base, bsc } from 'wagmi/chains';
import { 
  MetaMaskConnector,
  WalletConnectConnector,
  CoinbaseWalletConnector,
  InjectedConnector
} from 'wagmi/connectors';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, arbitrum, optimism, base, bsc],
  [
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_ID || '' }),
    publicProvider(),
  ]
);

// Configure connectors
const connectors = [
  new MetaMaskConnector({
    chains,
    options: {
      shimDisconnect: true,
    },
  }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
      metadata: {
        name: 'AutoNews.AI',
        description: 'AI-Powered News Analysis & NFT Trading Platform',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo.png`],
      },
    },
  }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: 'AutoNews.AI',
      appLogoUrl: `${window.location.origin}/logo.png`,
    },
  }),
  new InjectedConnector({
    chains,
    options: {
      name: 'Injected Wallet',
      shimDisconnect: true,
    },
  }),
];

// Create wagmi config
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains };

// Supported wallets configuration
export const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using MetaMask wallet',
    downloadUrl: 'https://metamask.io/download/',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect with WalletConnect protocol',
    downloadUrl: 'https://walletconnect.com/',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🟦',
    description: 'Connect using Coinbase Wallet',
    downloadUrl: 'https://wallet.coinbase.com/',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Connect using Trust Wallet',
    downloadUrl: 'https://trustwallet.com/',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Connect using Phantom wallet',
    downloadUrl: 'https://phantom.app/',
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    icon: '🐰',
    description: 'Connect using Rabby wallet',
    downloadUrl: 'https://rabby.io/',
  },
];

// Network configurations
export const SUPPORTED_NETWORKS = [
  {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
  },
  {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    icon: '🟣',
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorer: 'https://polygonscan.com',
  },
  {
    chainId: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    icon: '🔵',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
  },
  {
    chainId: 10,
    name: 'Optimism',
    symbol: 'ETH',
    icon: '🔴',
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  {
    chainId: 8453,
    name: 'Base',
    symbol: 'ETH',
    icon: '🔷',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
  {
    chainId: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: '🟡',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com',
  },
];

// Token configurations for trading
export const SUPPORTED_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    addresses: {
      1: '0x0000000000000000000000000000000000000000', // Native ETH
      137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
    },
    icon: '⟠',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      1: '0xA0b86a33E6441E6645B64F2BD8B9F59F3E2E5B47', // USDC on Ethereum
      137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
    },
    icon: '💵',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    addresses: {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
      137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon
    },
    icon: '🟢',
  },
];

// Web3 utility functions
export const formatAddress = (address: string, length = 4): string => {
  if (!address) return '';
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`;
};

export const formatBalance = (balance: string | number, decimals = 4): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(decimals);
};

export const getNetworkName = (chainId: number): string => {
  const network = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
  return network?.name || 'Unknown Network';
};

export const getTokenBySymbol = (symbol: string, chainId: number) => {
  return SUPPORTED_TOKENS.find(token => 
    token.symbol === symbol && token.addresses[chainId as keyof typeof token.addresses]
  );
};