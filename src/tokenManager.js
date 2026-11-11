
import { getNetwork } from "./networkManager";

async function callContract(rpcUrl, contract, data) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        { to: contract, data },
        "latest"
      ],
      id: 1
    })
  });

  if (!response.ok) {
    throw new Error("Erreur de communication RPC.");
  }

  const result = await response.json();

  if (result.error || !result.result) {
    throw new Error("Contrat token inaccessible.");
  }

  return result.result;
}

function decodeString(hex) {
  const value = hex.replace(/^0x/, "");

  if (!value || value.length < 64) {
    return "";
  }

  const offset = Number(BigInt("0x" + value.slice(0, 64))) * 2;
  const length = Number(
    BigInt("0x" + value.slice(offset, offset + 64))
  );

  const start = offset + 64;
  const bytes = value.slice(start, start + length * 2);

  if (!bytes) return "";

  return decodeURIComponent(
    bytes.replace(/(..)/g, "%$1")
  );
}

function decodeBytes32(hex) {
  const value = hex.replace(/^0x/, "").slice(0, 64);
  const bytes = value.match(/.{2}/g) || [];

  return bytes
    .map(byte => parseInt(byte, 16))
    .filter(code => code !== 0)
    .map(code => String.fromCharCode(code))
    .join("");
}

async function readString(rpcUrl, contract, selector) {
  const result = await callContract(
    rpcUrl,
    contract,
    selector
  );

  try {
    return decodeString(result) || decodeBytes32(result);
  } catch {
    return decodeBytes32(result);
  }
}

export async function getTokenInfo(
  tokenAddress,
  networkKey
) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    throw new Error("Adresse de token invalide.");
  }

  const network = getNetwork(networkKey);

  const [name, symbol, decimalsResult] =
    await Promise.all([
      readString(
        network.rpcUrl,
        tokenAddress,
        "0x06fdde03"
      ),
      readString(
        network.rpcUrl,
        tokenAddress,
        "0x95d89b41"
      ),
      callContract(
        network.rpcUrl,
        tokenAddress,
        "0x313ce567"
      )
    ]);

  const decimals = Number(BigInt(decimalsResult));

  if (!Number.isInteger(decimals) || decimals > 255) {
    throw new Error("Décimales du token invalides.");
  }

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals,
    network: network.name
  };
}
