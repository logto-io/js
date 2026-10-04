/* eslint-disable @silverhand/fp/no-mutation */
import { baseUrl, redirectUrl, resourceIndicators } from '../consts';

const renderButton = (container, states) => {
  const { isAuthenticated, onClickSignIn, onClickSignOut } = states;

  const rendered = document.querySelector('#button');
  const button = rendered ?? document.createElement('button');
  button.id = 'button';
  button.innerHTML = isAuthenticated ? 'Sign Out' : 'Sign In';
  button.addEventListener('click', isAuthenticated ? onClickSignOut : onClickSignIn);

  if (!rendered) {
    container.append(button);
  }
};

const renderTable = (container, states) => {
  const { userInfo } = states;

  // Generate display table for ID token claims
  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  const thName = document.createElement('th');
  const thValue = document.createElement('th');
  thName.innerHTML = 'Name';
  thValue.innerHTML = 'Value';
  tr.append(thName, thValue);
  thead.append(tr);
  table.append(thead);

  const tbody = document.createElement('tbody');

  for (const [key, value] of Object.entries(userInfo)) {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    const tdValue = document.createElement('td');
    tdName.innerHTML = key;
    tdValue.innerHTML = typeof value === 'string' ? value : JSON.stringify(value);
    tr.append(tdName, tdValue);
    tbody.append(tr);
  }

  table.append(tbody);
  container.append(table);
};

const renderTokenTable = (container, logtoClient, userInfo) => {
  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  const thName = document.createElement('th');
  const thValue = document.createElement('th');
  const thAction = document.createElement('th');

  thName.innerHTML = 'TokenType';
  thValue.innerHTML = 'Value';
  thAction.innerHTML = 'GetToken';

  tr.append(thName, thValue, thAction);
  thead.append(tr);
  table.append(thead);

  const tbody = document.createElement('tbody');

  const renderTokenRow = (name, value, action) => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    const tdValue = document.createElement('td');
    const tdAction = document.createElement('td');

    tdName.innerHTML = name;
    tdValue.innerHTML = value;

    const getTokenButton = document.createElement('button');
    getTokenButton.innerHTML = 'Get Token';
    tdAction.append(getTokenButton);

    getTokenButton.addEventListener('click', async () => {
      const claims = await action();
      tdValue.innerHTML = JSON.stringify(claims);
    });

    tr.append(tdName, tdValue, tdAction);
    tbody.append(tr);
  };

  // Get resource access token
  for (const resource of resourceIndicators) {
    renderTokenRow(resource, '', () => logtoClient.getAccessTokenClaims(resource));
  }

  // Get Organization access token
  const { organizations } = userInfo;
  if (organizations) {
    for (const organization of organizations) {
      renderTokenRow(organization, '', () => logtoClient.getOrganizationTokenClaims(organization));
    }
  }

  table.append(tbody);
  container.append(table);
};

const render = async (container, logtoClient) => {
  const onClickSignIn = () => logtoClient.signIn(redirectUrl);
  const onClickSignOut = () => logtoClient.signOut(baseUrl);

  const isAuthenticated = await logtoClient.isAuthenticated();

  renderButton(container, { isAuthenticated, onClickSignIn, onClickSignOut });

  if (isAuthenticated) {
    const userInfo = await logtoClient.fetchUserInfo();
    renderTable(container, { userInfo });
    renderTokenTable(container, logtoClient, userInfo);
  }
};

const Home = (app, logtoClient) => {
  if (!logtoClient) {
    throw new Error('no logto client found');
  }

  const fragment = document.createDocumentFragment();

  const container = document.createElement('div');
  container.classList.add('container');

  const h3 = document.createElement('h3');
  h3.innerHTML = 'Logto Browser Sample';
  container.append(h3);

  fragment.append(container);
  app.append(fragment);

  (async () => {
    await render(container, logtoClient);
  })();
};

export default Home;
/* eslint-enable @silverhand/fp/no-mutation */
