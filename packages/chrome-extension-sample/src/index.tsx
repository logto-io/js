/* eslint-disable @silverhand/fp/no-mutation */
import { client } from './service-worker.js';

// eslint-disable-next-line id-length
const $ = (selector: string) => {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  if (!(element instanceof HTMLElement)) {
    throw new TypeError(`Element is not HTMLElement: ${selector}`);
  }

  return element;
};

const loadAuthenticationState = async () => {
  const isAuthenticated = await client.isAuthenticated();

  $('#isAuthenticated').textContent = isAuthenticated ? 'true' : 'false';
  $('#signIn').style.display = isAuthenticated ? 'none' : 'block';
  $('#signOut').style.display = isAuthenticated ? 'block' : 'none';

  if (isAuthenticated) {
    const user = await client.getIdTokenClaims();
    $('#userInfo').textContent = JSON.stringify(user, null, 2);
    $('#userInfo').style.display = 'block';
  } else {
    $('#userInfo').style.display = 'none';
  }
};

window.addEventListener('load', () => {
  void loadAuthenticationState();

  $('#signIn').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: 'signIn' });
    void loadAuthenticationState();
  });

  $('#signOut').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: 'signOut' });
    void loadAuthenticationState();
  });
});
/* eslint-enable @silverhand/fp/no-mutation */
