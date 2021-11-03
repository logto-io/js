export const baseUrl = `http://${String(process.env.HOST)}:${String(process.env.PORT)}`;
export const oidcDomain = process.env.RAZZLE_OIDC_BASE_DOMAIN ?? 'N/A';
export const oidcUrl = process.env.RAZZLE_OIDC_BASE_DOMAIN
  ? `http://${process.env.RAZZLE_OIDC_BASE_DOMAIN}/oidc`
  : 'N/A';
