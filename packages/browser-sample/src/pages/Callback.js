/* eslint-disable @silverhand/fp/no-mutation */
import { baseUrl } from '../consts';

const Callback = async (app, logtoClient) => {
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

  await logtoClient.handleSignInCallback(window.location.href);

  if (logtoClient.isAuthenticated) {
    h3.innerHTML = 'Signed in!';

    const h4 = document.createElement('h4');
    container.append(h4);

    // eslint-disable-next-line @silverhand/fp/no-let
    let countDown = 3;
    h4.innerHTML = `Redirecting back to home page in ${countDown} seconds...`;

    const interval = setInterval(() => {
      countDown -= 1;
      h4.innerHTML = `Redirecting back to home page in ${countDown} seconds...`;

      if (countDown === 0) {
        clearInterval(interval);
        window.location.assign(baseUrl);
      }
    }, 1000);
  } else {
    h3.innerHTML = 'Sign in failed.';
  }
};

export default Callback;
/* eslint-enable @silverhand/fp/no-mutation */
