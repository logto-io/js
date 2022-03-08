import { LogtoProvider } from '@logto/react';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RequireAuth from './RequireAuth';
import { clientId, endpoint } from './consts';
import Callback from './pages/Callback';
import Home from './pages/Home';
import ProtectedResource from './pages/ProtectedResource';

import './App.module.scss';

export const App = () => {
  const logtoConfig = {
    clientId,
    endpoint,
  };

  return (
    <BrowserRouter>
      <LogtoProvider logtoConfig={logtoConfig}>
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
