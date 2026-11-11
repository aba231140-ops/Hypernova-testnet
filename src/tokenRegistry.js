
import { NETWORKS } from "./networks";

// Les contrats vérifiés seront ajoutés ici.
// Ne pas ajouter une adresse sans vérifier le réseau
// et le contrat officiel du token.

export const TOKEN_REGISTRY = {
  hyperevm: [],
  ethereum: [],
  bnb: [],
  polygon: [],
  arbitrum: []
};

export function getTokens(networkKey) {
  return TOKEN_REGISTRY[networkKey] || [];
}

export function isValidTokenAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function addToken(networkKey, token) {
  if (!NETWORKS[networkKey]) {
    throw new Error("Réseau non pris en charge.");
  }

  if (!isValidTokenAddress(token.address)) {
    throw new Error("Adresse de token invalide.");
  }

  const list = TOKEN_REGISTRY[networkKey];

  const exists = list.some(
    item =>
      item.address.toLowerCase() ===
      token.address.toLowerCase()
  );

  if (exists) {
    throw new Error("Ce token est déjà enregistré.");
  }

  list.push({
    ...token,
    verified: false
  });

  return list;
}
