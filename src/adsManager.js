export const ADS_CONFIG = {
  enabled: true,

  automaticAds: {
    enabled: true,
    provider: null,
  },

  directPartners: {
    enabled: true,
  },

  placements: {
    homeBanner: true,
    partnerProjects: true,
  },

  rules: {
    showDuringTransactions: false,
    showDuringWalletSigning: false,
    rewardXPForViewingAds: false,
  },
};

export function getAdsConfig() {
  return ADS_CONFIG;
}

export function isAdPlacementEnabled(placement) {
  return ADS_CONFIG.enabled &&
    ADS_CONFIG.placements[placement] === true;
}

export function getSponsoredLabel() {
  return "Publicité sponsorisée";
}
