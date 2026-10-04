/* eslint-disable @silverhand/fp/no-mutation */
import { baseUrl } from '../consts';

const Callback = (app, logtoClient) => {
  if (!logtoClient) {
    throw new Error('no logto client found');
  }

  const fragment = document.createDocumentFragment();
  const container = document.createElement('div');
  container.classList.add('container');

  const h3 = document.createElement('h3');
  h3.innerHTML = 'Authenticating...';

  container.append(h3);
  fragment.append(container);
  app.append(fragment);

  // Handle the sign-in callback
  (async () => {
    await logtoClient.handleSignInCallback(window.location.href);

    if (!logtoClient.isAuthenticated) {
      h3.innerHTML = 'Sign in failed.';
      return;
    }

    window.location.assign(baseUrl);
  })();
};

export default Callback;
/* eslint-enable @silverhand/fp/no-mutation */
