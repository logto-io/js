import { render, waitFor, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { LogtoProvider } from '.';
import ProtectedRoute from './ProtectedRoute';

const loginWithRedirect = jest.fn();
const isAuthenticated = jest.fn();

jest.mock('@logto/client', () => {
  const Mocked = jest.fn().mockImplementation(() => {
    return {
      loginWithRedirect,
      isAuthenticated,
    };
  });
  return {
    default: Mocked,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    create: jest.fn().mockImplementation(() => new Mocked()),
  };
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

      expect(loginWithRedirect).toHaveBeenCalledTimes(1);
    });

    test('protected content should not be rendered', async () => {
      render(renderWrapper(<ProtectedRoute path="/">protected</ProtectedRoute>));

      await waitFor(() => {
        expect(loginWithRedirect).toHaveBeenCalled();
      });

      expect(screen.queryByText('protected')).toBeNull();
    });
  });

  describe('authenticated', () => {
    beforeEach(() => {
      isAuthenticated.mockImplementation(() => true);
    });

    test('should render content', async () => {
      render(renderWrapper(<ProtectedRoute path="/">protected-content</ProtectedRoute>));

      await waitFor(() => {
        expect(screen.getByText('protected-content')).not.toBeUndefined();
      });
    });

    test('`loginWithRedirect` should not be called', async () => {
      render(renderWrapper(<ProtectedRoute path="/">protected-content</ProtectedRoute>));

      await waitFor(() => {
        expect(screen.getByText('protected-content')).not.toBeUndefined();
      });

      expect(loginWithRedirect).not.toHaveBeenCalled();
    });
  });
});
