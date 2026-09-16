import { trySafe } from '@silverhand/essentials';
import { type H3Event, getQuery, getRequestURL, sendRedirect } from 'h3';
import type { RuntimeConfig } from 'nuxt/schema';

import { respondWithAccessToken } from './access-token';
import { createLogtoClient, resolveLogtoConfig } from './client';
import { defaults } from './constants';

export const logtoEventHandler = async (event: H3Event, config: RuntimeConfig) => {
  const {
    logtoConfig,
    fetchUserInfo,
    pathnames,
    postCallbackRedirectUri,
    postLogoutRedirectUri,
    customRedirectBaseUrl,
    signInOptions,
  } = resolveLogtoConfig(config);

  const defaultValueKeys = Object.entries(defaults)
    // @ts-expect-error The type of `key` can only be string
    .filter(([key, value]) => logtoConfig[key] === value)
    .map(([key]) => key);

  if (defaultValueKeys.length > 0) {
    console.warn(
      `The following Logto configuration keys have default values: ${defaultValueKeys.join(
        ', '
      )}. Please replace them with your own values.`
    );
  }

  const requestUrl = getRequestURL(event);

  /**
   * This approach allows us to:
   * 1. Override the base URL when necessary (e.g., in proxy environments)
   * 2. Preserve the original path and query parameters
   * 3. Fall back to the original URL when no custom base is provided
   *
   * It's particularly useful in scenarios where the application is deployed
   * behind a reverse proxy or in environments that rewrite URLs.
   */
  const url = customRedirectBaseUrl
    ? new URL(requestUrl.pathname + requestUrl.search + requestUrl.hash, customRedirectBaseUrl)
    : requestUrl;

  const { logto } = await createLogtoClient(event, config);

  if (url.pathname === pathnames.signIn) {
    await logto.signIn({
      ...signInOptions,
      redirectUri: new URL(pathnames.callback, url).href,
    });
    return;
  }

  if (url.pathname === pathnames.signOut) {
    await logto.signOut(new URL(postLogoutRedirectUri, url).href);
    return;
  }

  if (url.pathname === pathnames.callback) {
    await logto.handleSignInCallback(url.href);
    await sendRedirect(event, postCallbackRedirectUri, 302);
    return;
  }

  /**
   * The access token request is answered before the user info is resolved: it only needs the
   * session, and skipping the user info avoids an unnecessary request to the userinfo endpoint.
   *
   * The module mirrors the pathname into the public runtime config so that the composable and this
   * handler cannot disagree about where the endpoint lives.
   */
  if (url.pathname === config.public.logto.accessTokenPath) {
    return respondWithAccessToken(event, logto, getQuery<AccessTokenQuery>(event));
  }

  // eslint-disable-next-line @silverhand/fp/no-mutation
  event.context.logtoClient = logto;
  // eslint-disable-next-line @silverhand/fp/no-mutation
  event.context.logtoUser = (await logto.isAuthenticated())
    ? await trySafe(async () => (fetchUserInfo ? logto.fetchUserInfo() : logto.getIdTokenClaims()))
    : undefined;
};

type AccessTokenQuery = {
  resource?: string;
  organizationId?: string;
};
