export const PARTNER_ADS = [];

export function isValidPartnerAd(ad) {
  if (!ad) return false;

  if (
    !ad.id ||
    !ad.name ||
    !ad.description ||
    !ad.url
  ) {
    return false;
  }

  if (ad.active !== true || ad.approved !== true) {
    return false;
  }

  try {
    const url = new URL(ad.url);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getActivePartnerAds() {
  return PARTNER_ADS.filter(isValidPartnerAd);
}

export function getPartnerAdById(id) {
  return PARTNER_ADS.find(
    ad => ad.id === id && isValidPartnerAd(ad)
  ) || null;
}
