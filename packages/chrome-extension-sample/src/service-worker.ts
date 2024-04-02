import LogtoClient from '@logto/chrome-extension';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const client = new LogtoClient({
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
});
/* eslint-enable @typescript-eslint/no-non-null-assertion */

const signIn = async () => {
  await client.signIn(chrome.identity.getRedirectURL('/callback'));
};

const signOut = async () => {
  await client.signOut(chrome.identity.getRedirectURL());
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Received message', message);

  if (message.action === 'signIn') {
    // eslint-disable-next-line promise/prefer-await-to-then
    signIn().finally(sendResponse);
    return true;
  }

  if (message.action === 'signOut') {
    // eslint-disable-next-line promise/prefer-await-to-then
    signOut().finally(sendResponse);
    return true;
  }

  return false;
});
