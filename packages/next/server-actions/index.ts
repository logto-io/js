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

export function handleSignIn(config: LogtoNextConfig, searchParams: URLSearchParams): Promise<void>;
export function handleSignIn(config: LogtoNextConfig, url: URL): Promise<void>;

/**
 * Handle sign in callback from search params or full redirect URL, save tokens to session
 */
export async function handleSignIn(
  config: LogtoNextConfig,
  searchParamsOrUrl: URLSearchParams | URL
): Promise<void> {
  const client = new LogtoClient(config);
  const newCookie = await client.handleSignInCallback(
    await getCookies(config),
    searchParamsOrUrl instanceof URL
      ? searchParamsOrUrl.toString()
      : `${config.baseUrl}/callback?${searchParamsOrUrl.toString()}`
  );

  if (newCookie) {
    await setCookies(newCookie, config);
  }
}

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
  getContextParameters?: Omit<
    GetContextParameters,
    'getAccessToken' | 'resource' | 'organizationId' | 'getOrganizationToken'
  > & {
    /** @deprecated use getAccessTokenRSC() */
    getAccessToken?: GetContextParameters['getAccessToken'];
    /** @deprecated use getOrganizationTokenRSC() */
    getOrganizationToken?: GetContextParameters['getOrganizationToken'];
    /** @deprecated use getAccessTokenRSC() */
    resource?: GetContextParameters['resource'];
    /** @deprecated use getOrganizationTokenRSC() */
    organizationId?: GetContextParameters['organizationId'];
  }
): Promise<LogtoContext> => {
  const client = new LogtoClient(config);
  return client.getLogtoContext(await getCookies(config), getContextParameters);
};

/**
 * Get organization tokens from session
 *
 * @deprecated Use getOrganizationToken instead
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

/**
 * Get access token for the specified resource or organization,
 * this function can be used in server actions or API routes
 */
export const getAccessToken = async (
  config: LogtoNextConfig,
  resource?: string,
  organizationId?: string
): Promise<string> => {
  const client = new LogtoClient(config);
  const { nodeClient, session } = await client.createNodeClientFromHeaders(
    await getCookies(config)
  );
  const accessToken = await nodeClient.getAccessToken(resource, organizationId);

  // Update access token cache
  const newCookie = await session.getValues?.();
  if (newCookie) {
    await setCookies(newCookie, config);
  }

  return accessToken;
};

/**
 * Get organization token from session,
 * this function can be used in server actions or API routes
 */
export const getOrganizationToken = async (
  config: LogtoNextConfig,
  organizationId?: string
): Promise<string> => {
  return getAccessToken(config, undefined, organizationId);
};

/**
 * Get access token for the specified resource or organization,
 * this function can be used in React Server Components (RSC)
 * Note: You can't write to the cookie in a React Server Component, so if the access token is refreshed, it won't be persisted in the session.
 * When using server actions or API routes, we highly recommand to use the getAccessToken method
 */
export const getAccessTokenRSC = async (
  config: LogtoNextConfig,
  resource?: string,
  organizationId?: string
): Promise<string> => {
  const client = new LogtoClient(config);
  const { nodeClient } = await client.createNodeClientFromHeaders(await getCookies(config));
  return nodeClient.getAccessToken(resource, organizationId);
};

/**
 * Get organization token from session,
 * this function can be used in React Server Components (RSC)
 * Note: You can't write to the cookie in a React Server Component, so if the access token is refreshed, it won't be persisted in the session.
 * When using server actions or API routes, we highly recommand to use the getOrganizationToken method
 */
export const getOrganizationTokenRSC = async (
  config: LogtoNextConfig,
  organizationId?: string
): Promise<string> => {
  return getAccessTokenRSC(config, undefined, organizationId);
};

export { default } from './client';
