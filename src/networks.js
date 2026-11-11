
export const NETWORKS = {
  hyperevm: {
    name: "HyperEVM Testnet",
    chainId: 998,
    chainIdHex: "0x3e6",
    rpcUrl: "https://rpc.hyperliquid-testnet.xyz/evm",
    currency: "HYPE",
    explorer: "https://testnet.purrsec.com"
  },

  ethereum: {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    chainIdHex: "0xaa36a7",
    rpcUrl: "https://rpc.sepolia.org",
    currency: "ETH",
    explorer: "https://sepolia.etherscan.io"
  },

  bnb: {
    name: "BNB Chain Testnet",
    chainId: 97,
    chainIdHex: "0x61",
    rpcUrl: "https://bsc-testnet-dataseed.bnbchain.org",
    currency: "tBNB",
    explorer: "https://testnet.bscscan.com"
  },

  polygon: {
    name: "Polygon Amoy",
    chainId: 80002,
    chainIdHex: "0x13882",
    rpcUrl: "https://polygon-amoy.g.alchemy.com/v2/demo",
    currency: "POL",
    explorer: "https://amoy.polygonscan.com"
  },

  arbitrum: {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    chainIdHex: "0x66eee",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    currency: "ETH",
    explorer: "https://sepolia.arbiscan.io"
  }
};

export const DEFAULT_NETWORK = NETWORKS.hyperevm;
