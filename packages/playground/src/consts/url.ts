export const baseUrl = `http://${String(process.env.HOST)}:${String(process.env.PORT)}`;
export const oidcUrl = process.env.RAZZLE_OIDC_BASE_URL ?? 'N/A';
