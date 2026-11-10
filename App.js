import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { getWalletBalance } from "./src/network";

export default function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkBalance(walletAddress) {
    try {
      setLoading(true);
      setError("");
      const result = await getWalletBalance(walletAddress);
      setBalance(result.toFixed(4));
    } catch (e) {
      setError("Impossible de lire le solde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HYPERNOVA</Text>
      <Text style={styles.network}>HyperEVM Testnet</Text>

      <View style={styles.card}>
        <Text style={styles.label}>SOLDE DU PORTEFEUILLE</Text>
        <Text style={styles.balance}>{balance} HYPE</Text>
        <Text style={styles.status}>Wallet Guardian : OK</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          setError("La connexion MetaMask mobile sera ajoutée à la prochaine étape.")
        }
      >
        <Text style={styles.buttonText}>CONNECTER METAMASK</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator color="#00BFFF" />}
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.footer}>HYPERNOVA • TESTNET v1.0</Text>
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
    marginBottom: 35
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
    fontSize: 12
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
  button: {
    backgroundColor: "#007BFF",
    padding: 17,
    borderRadius: 12,
    width: "100%",
    marginTop: 25
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold"
  },
  error: {
    color: "#FF7777",
    marginTop: 15
  },
  footer: {
    color: "#64748B",
    marginTop: 45,
    fontSize: 11
  }
});
