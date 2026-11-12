
import "@walletconnect/react-native-compat";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAppKit } from "@reown/appkit-react-native";
import { EthersAdapter } from "@reown/appkit-ethers-react-native";

const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID Reown introuvable.");
}

const makeNetwork = (
  id,
  name,
  symbol,
  rpc,
  explorer
) => ({
  id,
  name,
  chainNamespace: "eip155",
  caipNetworkId: `eip155:${id}`,
  nativeCurrency: {
    name: symbol,
    symbol,
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [rpc]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: explorer
    }
  },
  testnet: true
});

export const HYPERNOVA_NETWORKS = [
  makeNetwork(
    998,
    "HyperEVM Testnet",
    "HYPE",
    "https://rpc.hyperliquid-testnet.xyz/evm",
    "https://testnet.purrsec.com"
  ),
  makeNetwork(
    11155111,
    "Ethereum Sepolia",
    "ETH",
    "https://rpc.sepolia.org",
    "https://sepolia.etherscan.io"
  ),
  makeNetwork(
    97,
    "BNB Chain Testnet",
    "tBNB",
    "https://bsc-testnet-dataseed.bnbchain.org",
    "https://testnet.bscscan.com"
  ),
  makeNetwork(
    80002,
    "Polygon Amoy",
    "POL",
    "https://polygon-amoy.g.alchemy.com/v2/demo",
    "https://amoy.polygonscan.com"
  ),
  makeNetwork(
    421614,
    "Arbitrum Sepolia",
    "ETH",
    "https://sepolia-rollup.arbitrum.io/rpc",
    "https://sepolia.arbiscan.io"
  )
];

const storage = {
  getKeys: async () => {
    return await AsyncStorage.getAllKeys();
  },

  getEntries: async () => {
    const keys = await AsyncStorage.getAllKeys();

    const entries = await Promise.all(
      keys.map(async key => {
        const value = await AsyncStorage.getItem(key);

        try {
          return [key, JSON.parse(value)];
        } catch {
          return [key, value];
        }
      })
    );

    return entries;
  },

  getItem: async key => {
    const value = await AsyncStorage.getItem(key);

    if (value === null) return undefined;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },

  setItem: async (key, value) => {
    await AsyncStorage.setItem(
      key,
      JSON.stringify(value)
    );
  },

  removeItem: async key => {
    await AsyncStorage.removeItem(key);
  }
};

export const appKit = createAppKit({
  projectId,
  networks: HYPERNOVA_NETWORKS,
  defaultNetwork: HYPERNOVA_NETWORKS[0],
  adapters: [new EthersAdapter()],
  storage,

  metadata: {
    name: "HYPERNOVA",
    description: "Multichain EVM Decentralized Exchange",
    url: "https://hypernova.app",
    icons: [],
    redirect: {
      native: "hypernova://"
    }
  },

  themeMode: "dark",
  features: {
    swaps: false,
    onramp: false,
    socials: false
  }
});
  
