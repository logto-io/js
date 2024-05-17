'use server';

import { type LogtoContext, type GetContextParameters, type InteractionMode } from '@logto/node';
import { redirect } from 'next/navigation';

import type { LogtoNextConfig } from '../src/types.js';

import LogtoClient from './client';
import { getCookies, setCookies } from './cookie';

export type { LogtoContext, InteractionMode } from '@logto/node';

/**
 * Init sign in process and redirect to the Logto sign-in page
 */
export const signIn = async (
  config: LogtoNextConfig,
  redirectUri?: string,
  interactionMode?: InteractionMode
): Promise<void> => {
  const client = new LogtoClient(config);
  const { url, newCookie } = await client.handleSignIn(
    await getCookies(config),
    redirectUri ?? `${config.baseUrl}/callback`,
    interactionMode
  );
  if (newCookie) {
    await setCookies(newCookie, config);
  }
  redirect(url);
};

/**
 * Handle sign in callback from search params, save tokens to session
 */
export const handleSignIn = async (
  config: LogtoNextConfig,
  searchParams: URLSearchParams,
  redirectUri?: string
): Promise<void> => {
  const search = searchParams.toString();

  const client = new LogtoClient(config);
  const newCookie = await client.handleSignInCallback(
    await getCookies(config),
    redirectUri ?? `${config.baseUrl}/callback?${search}`
  );
  if (newCookie) {
    await setCookies(newCookie, config);
  }
};

/**
 * Init sign out process, clear session, and redirect to the Logto sign-out page
 */
export const signOut = async (config: LogtoNextConfig, redirectUri?: string): Promise<void> => {
  const client = new LogtoClient(config);
  const url = await client.handleSignOut(await getCookies(config), redirectUri);
  await setCookies('', config);
  redirect(url);
};

/**
 * Get Logto context from session, including auth status and claims
 */
export const getLogtoContext = async (
  config: LogtoNextConfig,
  getContextParameters?: GetContextParameters
): Promise<LogtoContext> => {
  const client = new LogtoClient(config);
  return client.getLogtoContext(await getCookies(config), getContextParameters);
};

/**
 * Get organization tokens from session
 */
export const getOrganizationTokens = async (config: LogtoNextConfig) => {
  const { isAuthenticated } = await getLogtoContext(config);

  if (!isAuthenticated) {
    return [];
  }

  const client = new LogtoClient(config);
  const { nodeClient } = await client.createNodeClientFromHeaders(await getCookies(config));

  const { organizations = [] } = await nodeClient.getIdTokenClaims();

  return Promise.all(
    organizations.map(async (organizationId) => ({
      id: organizationId,
      token: await nodeClient.getOrganizationToken(organizationId),
    }))
  );
};

export { default } from './client';
