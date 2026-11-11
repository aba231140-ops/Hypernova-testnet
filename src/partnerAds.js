export const PARTNER_ADS = [];

export function getActivePartnerAds() {
  return PARTNER_ADS.filter(ad => ad.active === true);
}

export function getPartnerAdById(id) {
  return PARTNER_ADS.find(ad => ad.id === id) || null;
}

export function isValidPartnerAd(ad) {
  return Boolean(
    ad &&
    ad.id &&
    ad.name &&
    ad.description &&
    ad.url &&
    ad.active === true
  );
}
