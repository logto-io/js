import LogtoClient from '@logto/chrome-extension';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const client = new LogtoClient({
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
});
/* eslint-enable @typescript-eslint/no-non-null-assertion */

const signIn = async () => {
  /**
   * Logto introduces several custom authentication parameters that allow you to tailor the desired sign-in experience for the end-users in addition to standard OIDC authentication parameters.
   * Ref: https://docs.logto.io/end-user-flows/authentication-parameters
   */
  await client.signIn({
    redirectUri: chrome.identity.getRedirectURL('/callback'),
    /**
     * A set of custom authentication parameters that allow you to tailor the desired first screen experience for the end users.
     * Ref: https://docs.logto.io/end-user-flows/authentication-parameters/first-screen
     */
    firstScreen: 'identifier:sign_in',
    /**
     * The `identifier` specifies the identifier types that the sign-in or sign-up form will take.
     * Ref: https://docs.logto.io/end-user-flows/authentication-parameters/first-screen#identifier
     */
    identifiers: ['username'],
  });
};

const signOut = async () => {
  await client.signOut(chrome.identity.getRedirectURL());
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Received message', message);

  if (message.action === 'signIn') {
    // eslint-disable-next-line promise/prefer-await-to-then
    void signIn().finally(sendResponse);
    return true;
  }

  if (message.action === 'signOut') {
    // eslint-disable-next-line promise/prefer-await-to-then
    void signOut().finally(sendResponse);
    return true;
  }

  return false;
});
