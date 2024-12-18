'use server';

import {
  type LogtoContext,
  type GetContextParameters,
  type InteractionMode,
  type SignInOptions,
} from '@logto/node';
import { redirect } from 'next/navigation';

import type { LogtoNextConfig } from '../src/types.js';

import LogtoClient from './client';

export type { LogtoContext, InteractionMode } from '@logto/node';

/**
 * Init sign in process and redirect to the Logto sign-in page
 */
export async function signIn(config: LogtoNextConfig, options?: SignInOptions): Promise<void>;
/**
 * Init sign in process and redirect to the Logto sign-in page
 *
 * @deprecated Use the object parameter instead.
 */
export async function signIn(
  config: LogtoNextConfig,
  redirectUri?: string,
  interactionMode?: InteractionMode
): Promise<void>;
export async function signIn(
  config: LogtoNextConfig,
  options?: SignInOptions | string,
  interactionMode?: InteractionMode
): Promise<void> {
  const client = new LogtoClient(config);
  const finalOptions: SignInOptions =
    typeof options === 'string' || options === undefined
      ? { redirectUri: options ?? `${config.baseUrl}/callback`, interactionMode }
      : options;

  const { url } = await client.handleSignIn(finalOptions);
  redirect(url);
}

export function handleSignIn(config: LogtoNextConfig, searchParams: URLSearchParams): Promise<void>;
export function handleSignIn(config: LogtoNextConfig, url: URL): Promise<void>;

/**
 * Handle sign in callback from search params or full redirect URL, save tokens to session
 * @param config The Logto configuration object
 * @param searchParamsOrUrl Either URLSearchParams from the callback URL or the complete URL object
 */
export async function handleSignIn(
  config: LogtoNextConfig,
  searchParamsOrUrl: URLSearchParams | URL
): Promise<void> {
  const client = new LogtoClient(config);
  await client.handleSignInCallback(
    searchParamsOrUrl instanceof URL
      ? searchParamsOrUrl.toString()
      : `${config.baseUrl}/callback?${searchParamsOrUrl.toString()}`
  );
}

/**
 * Init sign out process, clear session, and redirect to the Logto sign-out page
 */
export const signOut = async (config: LogtoNextConfig, redirectUri?: string): Promise<void> => {
  const client = new LogtoClient(config);
  const url = await client.handleSignOut(redirectUri);
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
  return client.getLogtoContext(getContextParameters);
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
  const nodeClient = await client.createNodeClient();

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
  const nodeClient = await client.createNodeClient();
  const accessToken = await nodeClient.getAccessToken(resource, organizationId);

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
  const nodeClient = await client.createNodeClient({ ignoreCookieChange: true });
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
