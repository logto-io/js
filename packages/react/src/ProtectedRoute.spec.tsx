import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { LogtoProvider } from '.';
import ProtectedRoute from './ProtectedRoute';

const loginWithRedirect = jest.fn();
const isAuthenticated = jest.fn();
const isLoginRedirect = jest.fn();
const getClaims = jest.fn(() => ({
  iss: 'logto.dev',
  sub: 'foo',
  aud: 'client1',
  exp: 123,
  iat: 123,
  at_hash: 'at_hash',
}));

jest.mock('@logto/browser', () => {
  const Mocked = jest.fn(() => {
    return {
      isAuthenticated,
      isLoginRedirect,
      loginWithRedirect,
      getClaims,
    };
  });
  return {
    default: Mocked,
    create: jest.fn(() => new Mocked()),
  };
});

afterEach(() => {
  isAuthenticated.mockClear();
  isLoginRedirect.mockClear();
});

const renderWrapper = (children: React.ReactNode) => {
  return (
    <MemoryRouter>
      <LogtoProvider
        logtoConfig={{
          domain: 'logto.dev',
          clientId: 'client',
        }}
      >
        {children}
      </LogtoProvider>
    </MemoryRouter>
  );
};

afterEach(() => {
  isAuthenticated.mockClear();
  loginWithRedirect.mockClear();
});

describe('ProtectedRoute', () => {
  describe('not authenticated', () => {
    beforeEach(() => {
      isAuthenticated.mockImplementation(() => false);
    });

    test('loginWithRedirect should be called once', async () => {
      render(renderWrapper(<ProtectedRoute path="/" />));

      await waitFor(() => {
        expect(loginWithRedirect).toHaveBeenCalled();
      });

      expect(loginWithRedirect).toHaveBeenCalled();
    });

    test('protected content should not be rendered', async () => {
      const { queryByText } = render(
        renderWrapper(<ProtectedRoute path="/">protected</ProtectedRoute>)
      );

      await waitFor(() => {
        expect(loginWithRedirect).toHaveBeenCalled();
      });

      expect(queryByText('protected')).toBeNull();
    });
  });

  describe('authenticated', () => {
    beforeEach(() => {
      isAuthenticated.mockImplementation(() => true);
    });

    test('should render content', async () => {
      const { getByText } = render(
        renderWrapper(<ProtectedRoute path="/">protected-content</ProtectedRoute>)
      );

      await waitFor(() => {
        expect(getByText('protected-content')).not.toBeUndefined();
      });
    });

    test('`loginWithRedirect` should not be called', async () => {
      const { getByText } = render(
        renderWrapper(<ProtectedRoute path="/">protected-content</ProtectedRoute>)
      );

      await waitFor(() => {
        expect(getByText('protected-content')).not.toBeUndefined();
      });

      expect(loginWithRedirect).not.toHaveBeenCalled();
    });
  });
});
