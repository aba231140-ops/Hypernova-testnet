import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity,
  View, RefreshControl, Linking
} from "react-native";
import {
  AppKit as AppKitModal, AppKitProvider, useAccount, useAppKit
} from "@reown/appkit-react-native";
import { appKit, HYPERNOVA_NETWORKS } from "./src/AppKitConfig";
import { getNativeBalance } from "./src/multiNetworkBalance";
import PartnerPage from "./src/PartnerPage";

const RPCS = {
  998: "https://rpc.hyperliquid-testnet.xyz/evm",
  11155111: "https://rpc.sepolia.org",
  97: "https://bsc-testnet-dataseed.bnbchain.org",
  80002: "https://polygon-amoy.g.alchemy.com/v2/demo",
  421614: "https://sepolia-rollup.arbitrum.io/rpc"
};
const EXPLORERS = {
  998: "https://testnet.purrsec.com",
  11155111: "https://sepolia.etherscan.io",
  97: "https://testnet.bscscan.com",
  80002: "https://amoy.polygonscan.com",
  421614: "https://sepolia.arbiscan.io"
};
const NAV = ["Accueil", "Marchés", "Explorer", "Faucet", "XP", "Publicités", "Profil"];

async function rpc(chainId, method, params = []) {
  const url = RPCS[Number(chainId)];
  if (!url) throw new Error("Réseau non pris en charge.");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || "Erreur RPC.");
  return data.result;
}
function shortAddress(value) {
  return value ? value.slice(0, 7) + "..." + value.slice(-5) : "";
}
function Panel({ title, children }) {
  return <View style={s.panel}><Text style={s.panelTitle}>{title}</Text>{children}</View>;
}
function Action({ title, onPress, secondary = false, disabled = false }) {
  return <TouchableOpacity disabled={disabled} onPress={onPress}
    style={[s.action, secondary && s.secondary, disabled && { opacity: 0.45 }]}>
    <Text style={s.actionText}>{title}</Text>
  </TouchableOpacity>;
}
function Dashboard() {
  const { open, disconnect, switchNetwork } = useAppKit();
  const { address, isConnected, chainId, chain } = useAccount();
  const [tab, setTab] = useState("Accueil");
  const [balance, setBalance] = useState("—");
  const [blocks, setBlocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [partnerPage, setPartnerPage] = useState(false);

  const activeChain = Number(chainId || 998);
  const networkName = chain?.name || (HYPERNOVA_NETWORKS.find(n => n.id === activeChain)?.name || "HyperEVM Testnet");

  async function refreshChainData() {
    if (!isConnected || !address || !RPCS[activeChain]) {
      setBalance("—"); setBlocks([]); setTransactions([]); return;
    }
    setBusy(true); setMessage("");
    try {
      const [bal, latest] = await Promise.all([
        getNativeBalance(address, activeChain === 998 ? "hyperevm" :
          activeChain === 11155111 ? "ethereum" :
          activeChain === 97 ? "bnb" :
          activeChain === 80002 ? "polygon" : "arbitrum"),
        rpc(activeChain, "eth_blockNumber")
      ]);
      setBalance(String(bal));
      const height = Number(BigInt(latest));
      const start = Math.max(0, height - 9);
      const list = await Promise.all(
        Array.from({ length: height - start + 1 }, (_, i) =>
          rpc(activeChain, "eth_getBlockByNumber", ["0x" + (start + i).toString(16), true])
        )
      );
      setBlocks(list.filter(Boolean).reverse());
      const txs = [];
      list.slice().reverse().forEach(block => {
        (block.transactions || []).forEach(tx => {
          if (tx.from?.toLowerCase() === address.toLowerCase() ||
              tx.to?.toLowerCase() === address.toLowerCase()) txs.push(tx);
        });
      });
      setTransactions(txs.slice(0, 10));
    } catch (e) {
      setMessage(e?.message || "Impossible de lire les données blockchain.");
    } finally { setBusy(false); }
  }
  useEffect(() => { refreshChainData(); }, [address, isConnected, chainId]);

  async function chooseNetwork(id) {
    try {
      const network = HYPERNOVA_NETWORKS.find(n => n.id === id);
      if (network) await switchNetwork(network);
    } catch (e) { setMessage("Changement de réseau refusé ou indisponible."); }
  }
  async function disconnectWallet() {
    try { await disconnect("eip155"); setBalance("—"); setMessage(""); }
    catch (e) { setMessage("Déconnexion impossible."); }
  }
  async function openExplorer(url) {
    try { await Linking.openURL(url); } catch (_) { setMessage("Lien indisponible."); }
  }

  if (partnerPage) return <PartnerPage onBack={() => setPartnerPage(false)} />;

  const renderHome = () => <>
    <Panel title="WALLET GUARDIAN">
      {isConnected && address ? <>
        <Text style={s.success}>● Portefeuille connecté</Text>
        <Text selectable style={s.address}>{address}</Text>
        <Text style={s.muted}>{networkName} · Chain ID {chainId || "—"}</Text>
        <Action title="DÉCONNECTER" onPress={disconnectWallet} secondary />
      </> : <>
        <Text style={s.muted}>Connexion non custodiale avec les portefeuilles EVM compatibles Reown.</Text>
        <Action title="CONNECTER MON WALLET" onPress={() => open()} />
      </>}
    </Panel>
    <Panel title="SOLDE DU PORTEFEUILLE">
      <Text style={s.big}>{balance} {activeChain === 998 ? "HYPE" : (chain?.nativeCurrency?.symbol || "ETH")}</Text>
      <Text style={s.muted}>Solde public lu sur le réseau sélectionné.</Text>
      <Action title="ACTUALISER" onPress={refreshChainData} secondary disabled={busy || !isConnected} />
    </Panel>
    <Panel title="RÉSEAUX TESTNET">
      {HYPERNOVA_NETWORKS.map(n => <TouchableOpacity key={n.id} style={s.networkRow}
        onPress={() => chooseNetwork(n.id)}>
        <Text style={s.networkName}>{n.name}</Text>
        <Text style={s.muted}>Chain ID {n.id}{activeChain === n.id ? " · ACTIF" : ""}</Text>
      </TouchableOpacity>)}
    </Panel>
    <Panel title="ACTIVITÉ RÉCENTE">
      {transactions.length ? transactions.slice(0, 5).map(tx =>
        <Text key={tx.hash} style={s.listLine}>{shortAddress(tx.from)} → {shortAddress(tx.to)} · {shortAddress(tx.hash)}</Text>
      ) : <Text style={s.muted}>Les transactions liées à cette adresse apparaîtront ici après lecture des blocs.</Text>}
    </Panel>
  </>;

  const renderExplorer = () => <Panel title="EXPLORATEUR — 10 DERNIERS BLOCS">
    <Text style={s.muted}>Réseau : {networkName}</Text>
    {busy ? <ActivityIndicator color="#00D5FF" /> : blocks.length ?
      blocks.map(b => <View key={b.hash} style={s.blockRow}>
        <Text style={s.networkName}>Bloc #{Number(BigInt(b.number))}</Text>
        <Text style={s.muted}>{b.transactions?.length || 0} transactions · {new Date(Number(BigInt(b.timestamp)) * 1000).toLocaleString()}</Text>
      </View>) : <Text style={s.muted}>Connecte un portefeuille sur un réseau testnet pour consulter les blocs.</Text>}
    <Action title="ACTUALISER LES BLOCS" onPress={refreshChainData} disabled={busy} />
    {transactions.map(tx => <Text key={tx.hash} style={s.listLine}>Transfert : {shortAddress(tx.from)} → {shortAddress(tx.to)}</Text>)}
  </Panel>;

  const renderFaucet = () => <Panel title="MULTITOKEN FAUCET">
    <Text style={s.muted}>Tokens prévus : HYPE · HN-USDT · HN-ETH · HNOVA</Text>
    <Text style={s.warning}>Le service de distribution sécurisé n'est pas encore connecté.</Text>
    <Text style={s.muted}>La limite de 12 heures par adresse devra être vérifiée côté serveur avant toute distribution.</Text>
    <Action title="FAUCET NON ACTIVÉ" disabled />
  </Panel>;

  const renderXP = () => <Panel title="HYPERNOVA XP">
    <Text style={s.big}>XP —</Text>
    <Text style={s.muted}>Bonus quotidien · activités éligibles · historique · classement.</Text>
    <Text style={s.warning}>Les points définitifs nécessitent une validation serveur anti-fraude. Aucun clic ou affichage publicitaire ne donne de XP.</Text>
    <Action title="SYSTÈME XP EN PRÉPARATION" disabled />
  </Panel>;

  const renderAds = () => <Panel title="HYPERNOVA ADS & REVENUE">
    <Text style={s.muted}>Espaces publicitaires automatiques et campagnes directes de partenaires.</Text>
    <Text style={s.warning}>Aucun réseau publicitaire ni compte de paiement n'est encore raccordé. Les revenus ne sont donc pas simulés.</Text>
    <Action title="VOIR NOS PARTENAIRES" onPress={() => setPartnerPage(true)} />
    <Text style={s.muted}>Les revenus publicitaires resteront séparés des fonds des utilisateurs.</Text>
  </Panel>;

  const renderProfile = () => <Panel title="PROFIL & SÉCURITÉ">
    <Text style={s.muted}>Adresse : {address ? shortAddress(address) : "Non connecté"}</Text>
    <Text style={s.muted}>Réseau : {networkName}</Text>
    <Text style={s.muted}>HYPERNOVA ne demande jamais de phrase secrète ni de clé privée.</Text>
    {isConnected ? <Action title="DÉCONNECTER LE WALLET" onPress={disconnectWallet} secondary /> :
      <Action title="CONNECTER LE WALLET" onPress={() => open()} />}
  </Panel>;

  const renderTab = () => {
    if (tab === "Accueil") return renderHome();
    if (tab === "Explorer") return renderExplorer();
    if (tab === "Faucet") return renderFaucet();
    if (tab === "XP") return renderXP();
    if (tab === "Publicités") return renderAds();
    if (tab === "Profil") return renderProfile();
    return <Panel title="MARCHÉS"><Text style={s.muted}>Le marché et le swap seront ajoutés dans une phase ultérieure, après validation de la version testnet.</Text></Panel>;
  };

  return <ScrollView style={s.screen} contentContainerStyle={s.content}
    refreshControl={<RefreshControl refreshing={busy} onRefresh={refreshChainData} tintColor="#00D5FF" />}>
    <Text style={s.logo}>HYPERNOVA</Text>
    <Text style={s.subtitle}>MULTICHAIN · NON-CUSTODIAL · TESTNET</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.nav}>
      {NAV.map(item => <TouchableOpacity key={item} onPress={() => setTab(item)}
        style={[s.navItem, tab === item && s.navActive]}>
        <Text style={[s.navText, tab === item && s.navTextActive]}>{item}</Text>
      </TouchableOpacity>)}
    </ScrollView>
    {message ? <Text style={s.warning}>{message}</Text> : null}
    {renderTab()}
    <Text style={s.footer}>HYPERNOVA © 2026 · VERSION TESTNET UNIQUEMENT</Text>
  </ScrollView>;
}

export default function App() {
  return <AppKitProvider instance={appKit}><Dashboard /><AppKitModal /></AppKitProvider>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050816" },
  content: { padding: 18, paddingTop: 48, paddingBottom: 36 },
  logo: { color: "#00D5FF", fontSize: 32, fontWeight: "900", textAlign: "center", letterSpacing: 2 },
  subtitle: { color: "#9AAAC5", fontSize: 9, textAlign: "center", letterSpacing: 2, marginTop: 5, marginBottom: 20 },
  nav: { marginBottom: 18, flexGrow: 0 },
  navItem: { paddingVertical: 10, paddingHorizontal: 12, marginRight: 7, borderRadius: 10, backgroundColor: "#111B32" },
  navActive: { backgroundColor: "#075B91", borderWidth: 1, borderColor: "#00D5FF" },
  navText: { color: "#AAB8D0", fontSize: 12, fontWeight: "700" },
  navTextActive: { color: "#FFFFFF" },
  panel: { backgroundColor: "#111B32", borderWidth: 1, borderColor: "#20385C", borderRadius: 15, padding: 17, marginBottom: 14 },
  panelTitle: { color: "#00D5FF", fontSize: 13, fontWeight: "900", letterSpacing: 1, marginBottom: 13 },
  big: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginVertical: 8 },
  address: { color: "#FFFFFF", fontSize: 12, marginVertical: 7 },
  muted: { color: "#9AAAC5", fontSize: 12, lineHeight: 19, marginTop: 4 },
  success: { color: "#45D6A0", fontWeight: "800" },
  warning: { color: "#FFCA76", fontSize: 12, lineHeight: 19, marginVertical: 8 },
  action: { backgroundColor: "#087DCE", padding: 13, borderRadius: 10, marginTop: 12 },
  secondary: { backgroundColor: "#34445E" },
  actionText: { color: "#FFFFFF", textAlign: "center", fontWeight: "900", fontSize: 12 },
  networkRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#24334D" },
  networkName: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  blockRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#24334D" },
  listLine: { color: "#DCE7F7", fontSize: 11, paddingVertical: 7 },
  footer: { color: "#72819B", textAlign: "center", fontSize: 9, marginTop: 15 }
});
    
