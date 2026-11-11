import { getAdsConfig } from "./adsManager";
import { getActivePartnerAds } from "./partnerAds";
import { canShowAd } from "./adPlacements";

export function getHomeAdvertising(
  isTransactionActive = false
) {
  const config = getAdsConfig();

  if (!config.enabled || isTransactionActive) {
    return {
      automaticAds: false,
      partnerAds: [],
    };
  }

  return {
    automaticAds:
      config.automaticAds.enabled &&
      Boolean(config.automaticAds.provider),

    partnerAds: canShowAd("partnerProjects")
      ? getActivePartnerAds()
      : [],
  };
}

export function getAdvertisingStatus() {
  const config = getAdsConfig();

  return {
    enabled: config.enabled,
    automaticAdsEnabled: config.automaticAds.enabled,
    automaticProviderConfigured:
      Boolean(config.automaticAds.provider),
    directPartnersEnabled: config.directPartners.enabled,
  };
}
