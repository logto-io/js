import { LogtoProvider, type LogtoConfig, UserScope } from '@logto/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RequireAuth from './RequireAuth';
import { appId, endpoint } from './consts';
import Callback from './pages/Callback';
import Home from './pages/Home';
import ProtectedResource from './pages/ProtectedResource';

import './App.module.scss';

export const App = () => {
  const config: LogtoConfig = {
    appId,
    endpoint,
    scopes: [UserScope.Email, UserScope.Phone, UserScope.CustomData, UserScope.Identities],
  };

  return (
    <BrowserRouter>
      <LogtoProvider config={config}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/protected-resource"
            element={
              <RequireAuth>
                <ProtectedResource />
              </RequireAuth>
            }
          />
        </Routes>
      </LogtoProvider>
    </BrowserRouter>
  );
};
