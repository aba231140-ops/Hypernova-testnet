
import { getNetwork } from "./networkManager";

export async function getNativeBalance(address, networkKey) {
  if (!address) {
    throw new Error("Adresse du portefeuille manquante.");
  }

  const network = getNetwork(networkKey);

  const response = await fetch(network.rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1
    })
  });

  if (!response.ok) {
    throw new Error("Connexion RPC impossible.");
  }

  const data = await response.json();

  if (data.error || !data.result) {
    throw new Error("Impossible de récupérer le solde.");
  }

  const balance = BigInt(data.result);

  return Number(balance) / 1e18;
}

export async function getTokenBalance(
  address,
  tokenAddress,
  networkKey
) {
  if (!address || !tokenAddress) {
    throw new Error("Adresse manquante.");
  }

  const network = getNetwork(networkKey);

  const data = await rpcRequest(network.rpcUrl, {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        to: tokenAddress,
        data:
          "0x70a08231" +
          address.toLowerCase().replace("0x", "").padStart(64, "0")
      },
      "latest"
    ],
    id: 2
  });

  return BigInt(data);
}

async function rpcRequest(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Erreur RPC.");
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.result;
}
