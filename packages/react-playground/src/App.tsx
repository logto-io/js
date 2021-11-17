import { LogtoProvider, ProtectedRoute } from '@logto/react';
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { oidcDomain } from '@/consts/url';
import Callback from '@/pages/Callback';
import Home from '@/pages/Home';

import PrivatePage from './pages/PrivatePage';
import '@/scss/normalized.scss';

const App = () => {
  const logtoConfig = {
    domain: oidcDomain,
    clientId: 'foo',
  };

  return (
    <LogtoProvider logtoConfig={logtoConfig}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/callback" component={Callback} />
        <ProtectedRoute exact path="/private" component={PrivatePage} />
      </Switch>
    </LogtoProvider>
  );
};

export default App;
