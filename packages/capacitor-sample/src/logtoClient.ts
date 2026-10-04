import CapacitorLogtoClient from "@logto/capacitor";

const redirectUri = "logto.demo://callback";

export const logtoClient = new CapacitorLogtoClient({
  endpoint: "<YOUR_LOGTO_ENDPOINT>",
  appId: "<YOUR_APP_ID>",
});

export const signIn = () => logtoClient.signIn(redirectUri);
export const signOut = () => logtoClient.signOut(redirectUri);
export const getUserClaims = () => logtoClient.getIdTokenClaims();
export const isAuthenticated = () => logtoClient.isAuthenticated;
