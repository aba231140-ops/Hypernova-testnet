import AdvertisingSection from "./src/AdvertisingSection";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking
} from "react-native";

import { createEVMClient } from "@metamask/connect-evm";
import { getWalletBalance } from "./src/network";
import { NETWORK } from "./src/config";

const CHAIN_ID = "0x3e6";

let clientPromise = null;

function getClient() {
  if (!clientPromise) {
    clientPromise = createEVMClient({
      dapp: {
        name: "HYPERNOVA",
        url: "https://github.com/aba231140-ops/Hypernova-testnet"
      },
      api: {
        supportedNetworks: {
          [CHAIN_ID]: NETWORK.rpcUrl
        }
      },
      mobile: {
        preferredOpenLink: (deeplink) =>
          Linking.openURL(deeplink)
      }
    });
  }

  return clientPromise;
}

export default function App() {
  const clientRef = useRef(null);

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [chainId, setChainId] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refreshBalance(walletAddress) {
    try {
      const result = await getWalletBalance(walletAddress);
      setBalance(result.toFixed(4));
      setError("");
    } catch (e) {
      setError("Impossible de lire le solde HYPE.");
    }
  }

  async function manualRefresh() {
    if (!address || loading) return;

    try {
      setLoading(true);
      setError("");
      await refreshBalance(address);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const client = await getClient();

        if (!active) return;

        clientRef.current = client;

        const provider = client.getProvider();

        provider.on("accountsChanged", (accounts) => {
          if (!active) return;

          const account = accounts[0] || "";
          setAddress(account);
          setBalance("0.0000");

          if (account) refreshBalance(account);
        });

        provider.on("chainChanged", (newChainId) => {
          if (active) setChainId(newChainId);
        });

        provider.on("disconnect", () => {
          if (!active) return;

          setAddress("");
          setBalance("0.0000");
          setChainId("");
        });

        setReady(true);
      } catch (e) {
        if (active) {
          setError("Initialisation MetaMask impossible.");
        }
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  async function connectWallet() {
    if (!clientRef.current) return;

    try {
      setLoading(true);
      setError("");

      const result = await clientRef.current.connect({
        chainIds: [CHAIN_ID]
      });

      const account = result.accounts?.[0];

      if (!account) {
        throw new Error("Aucun compte autorisé.");
      }

      setAddress(account);
      setChainId(result.chainId || "");
      await refreshBalance(account);

    } catch (e) {
      setError(
        e.code === 4001
          ? "Connexion refusée dans MetaMask."
          : e.message || "Connexion impossible."
      );
    } finally {
      setLoading(false);
    }
  }

  async function disconnectWallet() {
    try {
      if (clientRef.current) {
        await clientRef.current.disconnect();
      }

      setAddress("");
      setBalance("0.0000");
      setChainId("");
      setError("");
    } catch (e) {
      setError("Impossible de déconnecter le portefeuille.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HYPERNOVA</Text>

      <Text style={styles.network}>
        HyperEVM Testnet
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          SOLDE DU PORTEFEUILLE
        </Text>

        <Text style={styles.balance}>
          {balance} HYPE
        </Text>

        <Text style={styles.status}>
          Wallet Guardian : OK
        </Text>

        {!!address && (
          <>
            <Text style={styles.label}>
              ADRESSE PUBLIQUE
            </Text>

            <Text style={styles.address}>
              {address}
            </Text>

            <Text style={styles.network}>
              Chain ID : {chainId}
            </Text>

            {chainId.toLowerCase() !== CHAIN_ID && (
              <Text style={styles.warning}>
                Vérifie le réseau HyperEVM Testnet dans MetaMask.
              </Text>
            )}
          </>
        )}
      </View>

      {!address ? (
        <TouchableOpacity
          style={styles.button}
          onPress={connectWallet}
          disabled={!ready || loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "CONNEXION..."
              : ready
                ? "CONNECTER METAMASK"
                : "INITIALISATION..."}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={manualRefresh}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "ACTUALISATION..."
                : "ACTUALISER LE SOLDE"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={disconnectWallet}
          >
            <Text style={styles.buttonText}>
              DÉCONNECTER
            </Text>
          </TouchableOpacity>
        </>
      )}

      {loading && (
        <ActivityIndicator
          color="#00BFFF"
          style={{ marginTop: 15 }}
        />
      )}

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
      <AdvertisingSection />
      <Text style={styles.footer}>
        HYPERNOVA • TESTNET v1.0
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
    padding: 24
  },
  title: {
    color: "#00BFFF",
    fontSize: 36,
    fontWeight: "bold"
  },
  network: {
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 25
  },
  card: {
    width: "100%",
    backgroundColor: "#111B32",
    padding: 25,
    borderRadius: 18,
    alignItems: "center"
  },
  label: {
    color: "#9AAAC5",
    fontSize: 12,
    marginTop: 12
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "bold",
    marginVertical: 18
  },
  status: {
    color: "#00FF99"
  },
  address: {
    color: "#00BFFF",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10
  },
  warning: {
    color: "#FFCC66",
    textAlign: "center",
    marginTop: 10
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 17,
    borderRadius: 12,
    width: "100%",
    marginTop: 15
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold"
  },
  error: {
    color: "#FF7777",
    marginTop: 15,
    textAlign: "center"
  },
  footer: {
    color: "#64748B",
    marginTop: 35,
    fontSize: 11
  }
});
        
      
