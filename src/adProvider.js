export const AD_PROVIDER = {
  name: null,
  configured: false,
  approved: false,
};

export function isAdProviderReady() {
  return (
    AD_PROVIDER.configured === true &&
    AD_PROVIDER.approved === true &&
    Boolean(AD_PROVIDER.name)
  );
}

export function getAdProviderStatus() {
  return {
    name: AD_PROVIDER.name,
    configured: AD_PROVIDER.configured,
    approved: AD_PROVIDER.approved,
    ready: isAdProviderReady(),
  };
}
