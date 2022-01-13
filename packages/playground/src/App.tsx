import LogtoClient from '@logto/browser';
import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import { oidcDomain } from '@/consts/url';

import LogtoClientContext from './LogtoClientContext';
import Callback from './pages/Callback';
import Home from './pages/Home';
import './scss/normalized.scss';

const App = () => {
  const [logtoClient, setLogtoClient] = useState<LogtoClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const client = await LogtoClient.create({
        domain: oidcDomain,
        clientId: 'foo',
      });
      setLogtoClient(client);
      setLoading(false);
    })();
  }, []);

  return (
    <Switch>
      {!loading && (
        <LogtoClientContext.Provider value={logtoClient}>
          <Route exact path="/" component={Home} />
          <Route exact path="/callback" component={Callback} />
        </LogtoClientContext.Provider>
      )}
    </Switch>
  );
};

export default App;
