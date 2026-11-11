import { NETWORK } from "./config";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask n'est pas installé");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  return {
    address: accounts[0],
    network: NETWORK.name
  };
}NETWORK.name
