import { getAdsConfig } from "./adsManager";
import { getActivePartnerAds } from "./partnerAds";
import { canShowAd } from "./adPlacements";
import { isAdProviderReady } from "./adProvider";

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
      isAdProviderReady(),

    partnerAds:
      config.directPartners.enabled &&
      canShowAd("partnerProjects")
        ? getActivePartnerAds()
        : [],
  };
}

export function getAdvertisingStatus() {
  const config = getAdsConfig();

  return {
    enabled: config.enabled,
    automaticAdsEnabled: config.automaticAds.enabled,
    directPartnersEnabled: config.directPartners.enabled,
    providerReady: isAdProviderReady(),
  };
}
