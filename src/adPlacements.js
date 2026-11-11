export const AD_PLACEMENTS = {
  HOME_BANNER: "homeBanner",
  PARTNER_PROJECTS: "partnerProjects",
};

export function getAdPlacementConfig() {
  return {
    homeBanner: {
      enabled: true,
      position: "home",
      type: "automatic",
    },

    partnerProjects: {
      enabled: true,
      position: "home",
      type: "sponsored",
    },
  };
}

export function canShowAd(placement, isTransactionActive = false) {
  if (isTransactionActive) return false;

  const config = getAdPlacementConfig();
  return config[placement]?.enabled === true;
}
