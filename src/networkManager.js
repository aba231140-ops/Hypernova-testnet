
import {
  NETWORKS,
  DEFAULT_NETWORK
} from "./networks";

export function getNetwork(networkKey) {
  return NETWORKS[networkKey] || DEFAULT_NETWORK;
}

export function getAllNetworks() {
  return Object.entries(NETWORKS).map(
    ([key, network]) => ({
      key,
      ...network
    })
  );
}

export function isSupportedNetwork(chainId) {
  return Object.values(NETWORKS).some(
    network => network.chainId === Number(chainId)
  );
}

export function getNetworkByChainId(chainId) {
  return Object.values(NETWORKS).find(
    network => network.chainId === Number(chainId)
  ) || null;
}
