import LogtoClient, { UserScope } from '@logto/browser';

import { endpoint, appId, resourceIndicators, resourceScopes } from './consts';
import Callback from './pages/Callback';
import Home from './pages/Home';

import './index.scss';

(() => {
  const logtoClient = new LogtoClient({
    endpoint,
    appId,
    resources: resourceIndicators,
    scopes: [
      UserScope.Email,
      UserScope.Phone,
      UserScope.CustomData,
      UserScope.Identities,
      UserScope.Organizations,
      ...resourceScopes,
    ],
  });

  const main = () => {
    const app = document.querySelector('#app');

    // Could replace this with a formal router solution
    const isCallback = window.location.pathname.startsWith('/callback');

    const render = isCallback ? Callback : Home;

    render(app, logtoClient);
  };

  document.addEventListener('DOMContentLoaded', main);
})();
