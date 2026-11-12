
import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";

import { createEVMClient } from "@metamask/connect-evm";

import { getNativeBalance } from "./src/multiNetworkBalance";
import { NETWORK } from "./src/config";
import PartnerPage from "./src/PartnerPage";

export default function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPartnerPage, setShowPartnerPage] = useState(false);

  const clientRef = useRef(null);

  useEffect(() => {
    initializeWallet();
  }, []);

async function connectWallet() {
  try {
    setLoading(true);
    setError("");

    let client = clientRef.current;

    if (!client) {
      client = await initializeWallet();
    }

    if (!client) {
      throw new Error("Client wallet indisponible.");
    }

    const { accounts, chainId } = await client.connect({
      chainIds: [
        "0x3e6",
        "0xaa36a7",
        "0x61",
        "0x13882",
        "0x66eee"
      ]
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("Aucun compte connecté.");
    }

    const walletAddress = accounts[0];

    setAddress(walletAddress);
    setChainId(chainId);

    if (chainId === "0x3e6") {
      const walletBalance = await getNativeBalance(
        walletAddress,
        "hyperevm"
      );
      setBalance(String(walletBalance));
    } else {
      setBalance("0");
    }

  } catch (err) {
    console.log("Wallet connection:", err);
    setError(
      err.message || "Connexion impossible au portefeuille."
    );
  } finally {
    setLoading(false);
  }
}
  
async function initializeWallet() {
  try {
    setLoading(true);
    setError("");

    const client = await createEVMClient({
      dapp: {
        name: "HYPERNOVA",
        url: "https://hypernova.app"
      },
      api: {
        supportedNetworks: {
          "0x3e6": "https://rpc.hyperliquid-testnet.xyz/evm",
          "0xaa36a7": "https://rpc.sepolia.org",
          "0x61": "https://bsc-testnet-dataseed.bnbchain.org",
          "0x13882": "https://polygon-amoy.g.alchemy.com/v2/demo",
          "0x66eee": "https://sepolia-rollup.arbitrum.io/rpc"
        }
      },
      mobile: {
        preferredOpenLink: (deeplink) => {
          Linking.openURL(deeplink).catch((err) => {
            console.log("Ouverture MetaMask impossible:", err);
          });
        }
      }
    });

    clientRef.current = client;
    setReady(true);

    return client;

  } catch (err) {
    console.log("Wallet initialization:", err);
    setError("Initialisation du portefeuille impossible.");
    return null;

  } finally {
    setLoading(false);
  }
}
  
  function disconnectWallet() {
    setAddress("");
    setBalance("0");
    setChainId("");
    setError("");
  }

  if (showPartnerPage) {
    return (
      <PartnerPage
        onBack={() => setShowPartnerPage(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HYPERNOVA</Text>

      <Text style={styles.subtitle}>
        MULTICHAIN DECENTRALIZED EXCHANGE
      </Text>

      <View style={styles.networkCard}>
        <Text style={styles.networkTitle}>
          RÉSEAU ACTUEL
        </Text>

        <Text style={styles.networkName}>
          HyperEVM Testnet
        </Text>

        <Text style={styles.networkInfo}>
          Chain ID : {NETWORK.chainId}
        </Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>
          SOLDE HYPE
        </Text>

        <Text style={styles.balance}>
          {balance} HYPE
        </Text>
      </View>

      {address ? (
        <View style={styles.walletCard}>
          <Text style={styles.walletTitle}>
            PORTEFEUILLE CONNECTÉ
          </Text>

          <Text style={styles.address}>
            {address}
          </Text>

          <Text style={styles.chain}>
            Chain ID : {chainId}
          </Text>

          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={disconnectWallet}
          >
            <Text style={styles.buttonText}>
              DÉCONNECTER
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={connectWallet}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              CONNECTER MON WALLET
            </Text>
          )}
        </TouchableOpacity>
      )}

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles.partnerButton}
        onPress={() => setShowPartnerPage(true)}
      >
        <Text style={styles.buttonText}>
          VOIR NOS PARTENAIRES
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        HYPERNOVA © 2026
      </Text>

      <Text style={styles.disclaimer}>
        Version de développement - Testnet uniquement
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  logo: {
    color: "#00BFFF",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    color: "#9AAAC5",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 30,
    textAlign: "center",
  },

  networkCard: {
    width: "100%",
    backgroundColor: "#111B32",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },

  networkTitle: {
    color: "#9AAAC5",
    fontSize: 11,
  },

  networkName: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 8,
  },

  networkInfo: {
    color: "#00BFFF",
    marginTop: 5,
  },

  balanceCard: {
    width: "100%",
    backgroundColor: "#111B32",
    padding: 22,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 15,
  },

  balanceTitle: {
    color: "#9AAAC5",
    fontSize: 12,
  },

  balance: {
    color: "#00BFFF",
    fontSize: 27,
    fontWeight: "bold",
    marginTop: 10,
  },

  walletCard: {
    width: "100%",
    backgroundColor: "#111B32",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },

  walletTitle: {
    color: "#00BFFF",
    fontWeight: "bold",
    marginBottom: 10,
  },

  address: {
    color: "#FFFFFF",
    fontSize: 12,
  },

  chain: {
    color: "#9AAAC5",
    marginTop: 8,
  },

  connectButton: {
    width: "100%",
    backgroundColor: "#007BFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },

  disconnectButton: {
    backgroundColor: "#B83245",
    padding: 13,
    borderRadius: 10,
    marginTop: 15,
  },

  partnerButton: {
    width: "100%",
    backgroundColor: "#123B63",
    borderWidth: 1,
    borderColor: "#00BFFF",
    padding: 15,
    borderRadius: 12,
    marginTop: 5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },

  error: {
    color: "#FF6B6B",
    textAlign: "center",
    marginVertical: 10,
  },

  footer: {
    color: "#9AAAC5",
    marginTop: 30,
    fontSize: 12,
  },

  disclaimer: {
    color: "#77849B",
    fontSize: 10,
    marginTop: 8,
  },
});
    
