
import React, { useEffect, useState } from "react";

import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect
} from "@reown/appkit/react";

import { EthersAdapter } from "@reown/appkit-adapter-ethers";

import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { supabase } from "./src/supabase";

const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID;



const makeNetwork = (id, name, symbol, rpc, explorer) => ({
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

const networks = [
  makeNetwork(
    11155111,
    "Ethereum Sepolia",
    "ETH",
    "https://rpc.sepolia.org",
    "https://sepolia.etherscan.io"
  ),
  makeNetwork(
    998,
    "HyperEVM Testnet",
    "HYPE",
    "https://rpc.hyperliquid-testnet.xyz/evm",
    "https://testnet.purrsec.com"
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



let appKitInitError = "";

if (!projectId) {
  appKitInitError = "La variable EXPO_PUBLIC_REOWN_PROJECT_ID est absente.";
} else {
  try {
    createAppKit({
      adapters: [new EthersAdapter()],
      networks,
      projectId,
      defaultNetwork: networks[0],
      metadata: {
        name: "HYPERNOVA",
        description: "Multichain EVM Decentralized Exchange",
        url: "https://hypernova-testnet.vercel.app",
        icons: []
      },
      features: {
  analytics: false,
  swaps: false,
  onramp: false,
  socials: false
},
      showWallets: true,
allWallets: "SHOW",
enableInjected: true,
enableEIP6963: true,
featuredWalletIds: [
  "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
  "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0"
],
themeMode: "dark"
    });
  } catch (error) {
    appKitInitError =
      error && error.message ? error.message : String(error);

    console.error("HYPERNOVA AppKit error:", error);
  }
}


const rpcUrls = {
  998: "https://rpc.hyperliquid-testnet.xyz/evm",
  11155111: "https://rpc.sepolia.org",
  97: "https://bsc-testnet-dataseed.bnbchain.org",
  80002: "https://polygon-amoy.g.alchemy.com/v2/demo",
  421614: "https://sepolia-rollup.arbitrum.io/rpc"
};


const tabs = [
  "Accueil",
  "Marchés",
  "Explorer",
  "Faucet",
  "XP",
  "Publicités",
  "Profil"
];

function shortAddress(address) {
  return address
    ? address.slice(0, 7) + "..." + address.slice(-5)
    : "";
}

async function testSupabaseConnection() {
  try {
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) throw error;

    return "Connexion Supabase réussie.";
  } catch (error) {
    console.error("Erreur Supabase :", error);
    return "Échec du test : " + error.message;
  }
}
function AppContent() {
  const { open } = useAppKit();
  const account = useAppKitAccount({
  chainNamespace: "eip155"
});
  const network = useAppKitNetwork();
  const { disconnect } = useDisconnect();

  const [tab, setTab] = useState("Accueil");
  const [balance, setBalance] = useState("—");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState("Test non effectué");
const [testingSupabase, setTestingSupabase] = useState(false);
  const [profileData, setProfileData] = useState(null);
const [profileStatus, setProfileStatus] = useState(
  "Connecte ton wallet pour créer ton profil."
);
const [syncingProfile, setSyncingProfile] = useState(false);

  const address = account.address;
  const isConnected = account.isConnected;
  const walletStatus = account.status || "inconnu";

  const chainId = Number(network.chainId || 11155111);
  const activeNetwork =
    networks.find(n => n.id === chainId) || networks[0];

  async function loadBalance() {
    if (!isConnected || !address) {
      setBalance("—");
      return;
    }

    const url = rpcUrls[chainId];

    if (!url) {
      setMessage("Réseau non pris en charge.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const value = Number(BigInt(data.result)) / 1e18;

      setBalance(value.toFixed(5));
    } catch (error) {
      setMessage(
        "Lecture du solde impossible sur ce réseau."
      );
    } finally {
      setBusy(false);
    }
  }

    async function syncWalletProfile(walletAddress) {
    if (!walletAddress) return;

    setSyncingProfile(true);
    setProfileStatus("Enregistrement du profil...");

    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Rechercher si ce wallet possède déjà un profil
      const { data: walletLink, error: lookupError } = await supabase
        .from("wallets")
        .select("profile_id")
        .eq("wallet_address", normalizedAddress)
        .maybeSingle();

      if (lookupError) throw lookupError;

      let profileId = walletLink?.profile_id;

      // Créer un nouveau profil si nécessaire
      if (!profileId) {
        const newProfileId = crypto.randomUUID();
        const newWalletId = crypto.randomUUID();

        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: newProfileId,
            username: "nova_" + normalizedAddress.slice(2, 10),
            display_name: "HYPERNOVA User"
          })
          .select("id")
          .single();

        if (profileError) throw profileError;

        profileId = newProfile.id;

        const { error: walletError } = await supabase
          .from("wallets")
          .insert({
            id: newWalletId,
            profile_id: profileId,
            wallet_address: normalizedAddress
          });

        if (walletError) throw walletError;
      }

      // Récupérer le profil enregistré
      const { data: profile, error: readError } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("id", profileId)
        .single();

      if (readError) throw readError;

      setProfileData(profile);
      setProfileStatus("Profil HYPERNOVA enregistré avec succès.");

    } catch (error) {
      console.error("Erreur profil :", error);
      setProfileStatus("Erreur : " + error.message);
    } finally {
      setSyncingProfile(false);
    }
    }
  useEffect(() => {
    loadBalance();
  }, [address, isConnected, chainId]);

  async function changeNetwork(id) {
    try {
      const selected = networks.find(n => n.id === id);

      if (selected) {
        await network.switchNetwork(selected);
      }
    } catch (error) {
      setMessage("Impossible de changer de réseau.");
    }
  }

  async function disconnectWallet() {
    try {
      await disconnect();
      setBalance("—");
      setMessage("");
    } catch (error) {
      setMessage("Déconnexion impossible.");
    }
  }

  function panel(title, content) {
    return (
      <View style={s.panel}>
        <Text style={s.panelTitle}>{title}</Text>
        {content}
      </View>
    );
  }

  function action(label, callback, secondary = false) {
    return (
      <TouchableOpacity
        onPress={callback}
        style={[
          s.button,
          secondary && s.secondary
        ]}
      >
        <Text style={s.buttonText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function renderContent() {
    if (tab === "Accueil") {
      return (
        <>
          {panel(
            "WALLET GUARDIAN",
            <>
              {isConnected ? (
                <>
                  <Text style={s.success}>
                    ● Portefeuille connecté
                  </Text>

                  <Text selectable style={s.address}>
                    {address}
                  </Text>

                  <Text style={s.muted}>
                    {activeNetwork.name}
                  </Text>

                  {action(
                    "DÉCONNECTER",
                    disconnectWallet,
                    true
                  )}
                </>
              ) : (
                <>
                  <Text style={s.muted}>
                    Connecte ton portefeuille EVM avec Reown.
                    Plusieurs wallets compatibles sont disponibles.
                  </Text>

                  {action(
                    "CONNECTER MON WALLET",
                    () => open()
                  )}
                </>
              )}
            </>
          )}

          {panel(
            "SOLDE DU PORTEFEUILLE",
            <>
              <Text style={s.big}>
                {busy
                  ? "Chargement..."
                  : balance + " " +
                    activeNetwork.nativeCurrency.symbol}
              </Text>

              {action(
                "ACTUALISER",
                loadBalance,
                true
              )}
            </>
          )}

          {panel(
            "RÉSEAUX TESTNET",
            networks.map(n => (
              <TouchableOpacity
                key={n.id}
                style={s.networkRow}
                onPress={() => changeNetwork(n.id)}
              >
                <Text style={s.white}>
                  {n.name}
                </Text>

                <Text style={s.muted}>
                  Chain ID {n.id}
                  {chainId === n.id ? " · ACTIF" : ""}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </>
      );
    }

    if (tab === "Marchés") {
      return panel(
        "MARCHÉS",
        <Text style={s.muted}>
          Le swap, le trading spot et les autres marchés
          seront intégrés progressivement après validation
          de la version testnet.
        </Text>
      );
    }

    if (tab === "Explorer") {
      return panel(
        "EXPLORATEUR",
        <>
          <Text style={s.muted}>
            Réseau : {activeNetwork.name}
          </Text>

          <Text style={s.muted}>
            Consulte les transactions sur l'explorateur
            du réseau.
          </Text>

          {action(
            "OUVRIR L'EXPLORATEUR",
            () => {
              if (typeof window !== "undefined") {
                window.open(
                  activeNetwork.blockExplorers.default.url,
                  "_blank"
                );
              }
            }
          )}
        </>
      );
    }

    if (tab === "Faucet") {
      return panel(
        "MULTITOKEN FAUCET",
        <>
          <Text style={s.muted}>
            Distribution de tokens de test prévue.
          </Text>

          <Text style={s.warning}>
            Faucet non activé. La limite de 12 heures
            devra être vérifiée côté serveur.
          </Text>
        </>
      );
    }

    if (tab === "XP") {
      return panel(
        "HYPERNOVA XP",
        <>
          <Text style={s.big}>XP —</Text>

          <Text style={s.muted}>
            Points, activités éligibles et historique seront
            ajoutés avec un système de validation anti-fraude.
          </Text>
        </>
      );
    }

    if (tab === "Publicités") {
      return panel(
        "HYPERNOVA ADS & REVENUE",
        <>
          <Text style={s.muted}>
            Publicités partenaires et demandes de campagnes
            sponsorisées.
          </Text>

          <Text style={s.warning}>
            Les campagnes nécessiteront une validation manuelle.
            Aucun revenu n'est simulé.
          </Text>

          <Text style={s.muted}>
            Les revenus publicitaires restent séparés
            des fonds des utilisateurs.
          </Text>
        </>
      );
    }

    return panel(
      "PROFIL & SÉCURITÉ",
      <>
        <Text style={s.muted}>
          Adresse : {shortAddress(address) || "Non connecté"}
        </Text>

        <Text style={s.muted}>
          Réseau : {activeNetwork.name}
        </Text>

        <Text style={s.muted}>
          HYPERNOVA ne demande jamais de phrase secrète
          ni de clé privée.
        </Text>

        {isConnected
          ? action("DÉCONNECTER", disconnectWallet, true)
          : action("CONNECTER MON WALLET", () => open())}
<Text style={s.muted}>
  Supabase : {supabaseStatus}
</Text>

<TouchableOpacity
  style={s.button}
  disabled={testingSupabase}
  onPress={async () => {
    setTestingSupabase(true);
    setSupabaseStatus("Connexion en cours...");

    const result = await testSupabaseConnection();

    setSupabaseStatus(result);
    setTestingSupabase(false);
  }}
>
  <Text style={s.buttonText}>
    {testingSupabase ? "TEST EN COURS..." : "TESTER SUPABASE"}
  </Text>
</TouchableOpacity>
      </>
    );
  }

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
    >
      <Text style={s.logo}>HYPERNOVA</Text>
        <Text style={s.warning}>
  Diagnostic : {walletStatus}
</Text>

<Text style={s.warning}>
  Adresse : {account.address || "Aucune adresse détectée"}
</Text>

      <Text style={s.subtitle}>
        MULTICHAIN · NON-CUSTODIAL · TESTNET
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.nav}
      >
        {tabs.map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => setTab(item)}
            style={[
              s.navItem,
              tab === item && s.navActive
            ]}
          >
            <Text style={s.navText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {message ? (
        <Text style={s.warning}>{message}</Text>
      ) : null}

      {busy ? (
        <ActivityIndicator color="#00D5FF" />
      ) : null}

      {renderContent()}

      <Text style={s.footer}>
        HYPERNOVA © 2026 · VERSION TESTNET UNIQUEMENT
      </Text>
    </ScrollView>
  );
}

class WebErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      error
    };
  }

  componentDidCatch(error) {
    console.error(
      "HYPERNOVA web render error:",
      error
    );
  }

  render() {
    if (this.state.error) {
      const message =
        this.state.error.message ||
        String(this.state.error);

      return (
        <View style={s.screen}>
          <Text style={s.logo}>
            HYPERNOVA
          </Text>

          <Text style={s.warning}>
            ERREUR AU DÉMARRAGE DE L'APPLICATION WEB :
          </Text>

          <Text selectable style={s.address}>
            {message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function AppWeb() {
  if (appKitInitError) {
    return (
      <View style={s.screen}>
        <Text style={s.logo}>
          HYPERNOVA
        </Text>

        <Text style={s.warning}>
          ERREUR D'INITIALISATION REOWN :
        </Text>

        <Text selectable style={s.address}>
          {appKitInitError}
        </Text>
      </View>
    );
  }

  return (
    <WebErrorBoundary>
      <AppContent />
    </WebErrorBoundary>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050816"
  },

  content: {
    padding: 18,
    paddingTop: 40,
    paddingBottom: 36
  },

  logo: {
    color: "#00D5FF",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 2
  },

  subtitle: {
    color: "#9AAAC5",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 5,
    marginBottom: 20
  },

  nav: {
    marginBottom: 18,
    flexGrow: 0
  },

  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 7,
    borderRadius: 10,
    backgroundColor: "#111B32"
  },

  navActive: {
    backgroundColor: "#075B91",
    borderWidth: 1,
    borderColor: "#00D5FF"
  },

  navText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },

  panel: {
    backgroundColor: "#111B32",
    borderWidth: 1,
    borderColor: "#20385C",
    borderRadius: 15,
    padding: 17,
    marginBottom: 14
  },

  panelTitle: {
    color: "#00D5FF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 13
  },

  big: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginVertical: 8
  },

  address: {
    color: "#FFFFFF",
    fontSize: 12,
    marginVertical: 7
  },

  muted: {
    color: "#9AAAC5",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 4
  },

  white: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13
  },

  success: {
    color: "#45D6A0",
    fontWeight: "800"
  },

  warning: {
    color: "#FFCA76",
    fontSize: 12,
    lineHeight: 19,
    marginVertical: 8
  },

  button: {
    backgroundColor: "#087DCE",
    padding: 13,
    borderRadius: 10,
    marginTop: 12
  },

  secondary: {
    backgroundColor: "#34445E"
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 12
  },

  networkRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#24334D"
  },

  footer: {
    color: "#72819B",
    textAlign: "center",
    fontSize: 9,
    marginTop: 15
  }
});
    
