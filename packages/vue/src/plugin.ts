import type { InteractionMode } from '@logto/browser';

import type { Context } from './context.js';
import { throwContextError } from './context.js';

export const createPluginMethods = (context: Context) => {
  const { logtoClient, setLoading, setError, setIsAuthenticated } = context;

  const signIn = async (redirectUri: string, interactionMode?: InteractionMode) => {
    if (!logtoClient.value) {
      return throwContextError();
    }

    try {
      setLoading(true);

      await logtoClient.value.signIn(redirectUri, interactionMode);
    } catch (error: unknown) {
      setError(error, 'Unexpected error occurred while signing in.');
    }
  };

  const signOut = async (postLogoutRedirectUri?: string) => {
    if (!logtoClient.value) {
      return throwContextError();
    }

    try {
      setLoading(true);

      await logtoClient.value.signOut(postLogoutRedirectUri);

      // We deliberately do NOT set isAuthenticated to false here, because the app state may change immediately
      // even before navigating to the oidc end session endpoint, which might cause rendering problems.
      // Moreover, since the location will be redirected, the isAuthenticated state will not matter any more.
    } catch (error: unknown) {
      setError(error, 'Unexpected error occurred while signing out.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    if (!logtoClient.value) {
      return throwContextError();
    }

    try {
      setLoading(true);

      return await logtoClient.value.fetchUserInfo();
    } catch (error: unknown) {
      setError(error, 'Unexpected error occurred while fetching user info.');
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async (resource?: string) => {
    if (!logtoClient.value) {
      return throwContextError();
    }

    try {
      setLoading(true);

      return await logtoClient.value.getAccessToken(resource);
    } catch (error: unknown) {
      setError(error, 'Unexpected error occurred while getting access token.');
    } finally {
      setLoading(false);
    }
  };

  const getIdTokenClaims = async () => {
    if (!logtoClient.value) {
      return throwContextError();
    }

    try {
      return await logtoClient.value.getIdTokenClaims();
    } catch (error: unknown) {
      setError(error, 'Unexpected error occurred while getting id token claims.');
    }
  };

  const handleSignInCallback = async (callbackUri: string, callbackFunction?: () => void) => {
    if (!logtoClient.value) {
      return throwContextError();
    }

    try {
      setLoading(true);
      await logtoClient.value.handleSignInCallback(callbackUri);
      setIsAuthenticated(true);
      callbackFunction?.();
    } catch (error: unknown) {
      setError(error, 'Unexpected error occurred while handling sign in callback.');
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signOut,
    fetchUserInfo,
    getAccessToken,
    getIdTokenClaims,
    handleSignInCallback,
  };
};
