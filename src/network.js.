import { NETWORK } from "./config";

export async function getWalletBalance(address) {
  const response = await fetch(NETWORK.rpcUrl, {
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

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return Number(BigInt(data.result)) / 1e18;
}
