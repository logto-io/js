import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  RouterContext,
  RouterContextProvider,
} from 'react-router';
import { redirect } from 'react-router';

import type { LogtoAuthClient, LogtoAuthRequestRuntime } from './request-runtime.js';

export type AuthRoutePaths = Readonly<{
  signIn: string;
  signUp?: string;
  callback: string;
  signOut: string;
}>;

/**
 * Called with the POST action request that starts sign-in or sign-up. Return a same-origin path to
 * persist through the sign-in session and use after the callback.
 */
export type ResolvePostCallbackRedirectUri = (signInRequest: Request) => string | Promise<string>;

export type ValidateAuthActionRequest = (
  request: Request
) => Response | void | Promise<Response | void>;

export type AuthRoutesOptions = Readonly<{
  paths: AuthRoutePaths;
  /** The post-callback destination or a resolver that runs when sign-in or sign-up starts. */
  postCallbackRedirectUri: string | ResolvePostCallbackRedirectUri;
  postSignOutRedirectUri: string;
  /** Runs before sign-in, sign-up, or sign-out. Return a Response to reject the request. */
  validateActionRequest?: ValidateAuthActionRequest;
}>;

type AuthRouteLoaderArgs = Pick<
  LoaderFunctionArgs<Readonly<RouterContextProvider>>,
  'context' | 'request' | 'url'
>;

type AuthRouteActionArgs = Pick<
  ActionFunctionArgs<Readonly<RouterContextProvider>>,
  'context' | 'request' | 'url'
>;

export type AuthRouteLoader = (args: AuthRouteLoaderArgs) => Promise<Response>;
export type AuthRouteAction = (args: AuthRouteActionArgs) => Promise<Response>;

export type AuthRoutes = Readonly<{
  loader: AuthRouteLoader;
  action: AuthRouteAction;
}>;

type CreateAuthRoutesOptions = Readonly<{
  baseUrl: string;
  requestRuntimeContext: RouterContext<LogtoAuthRequestRuntime>;
}>;

type AuthOperation = (client: LogtoAuthClient) => Promise<void>;

class NavigationCapture {
  private target: string | undefined;

  public readonly navigate = (url: string) => {
    this.target = url;
  };

  public readonly getTarget = () => {
    if (!this.target) {
      throw new TypeError('The Logto client did not provide a navigation target.');
    }

    return this.target;
  };

  public readonly getOptionalTarget = () => this.target;
}

const resolveUri = (baseUrl: string, uri: string) => new URL(uri, baseUrl).toString();

const resolveReturnUri = (baseUrl: string, uri: string) => {
  const base = new URL(baseUrl);
  const resolved = new URL(uri, base);

  if (!uri.startsWith('/') || uri.startsWith('//') || resolved.origin !== base.origin) {
    throw new TypeError(
      'The resolved post-callback redirect URI must be a same-origin path beginning with "/".'
    );
  }

  return resolved.toString();
};

const createMethodNotAllowedResponse = (allowedMethod: 'GET' | 'POST') =>
  new Response(null, {
    status: 405,
    statusText: 'Method Not Allowed',
    headers: { Allow: allowedMethod },
  });

const createNotFoundResponse = () => new Response(null, { status: 404, statusText: 'Not Found' });

const getCallbackUri = (baseUrl: string, callbackPath: string, request: Request) => {
  const { search } = new URL(request.url);

  // Use the configured public URI so callback verification remains stable behind a proxy.
  return new URL(search, resolveUri(baseUrl, callbackPath)).toString();
};

const checkpointWithNavigation = async (
  requestRuntime: LogtoAuthRequestRuntime,
  operation: AuthOperation
) => {
  const navigation = new NavigationCapture();

  await requestRuntime.sessionRuntime.checkpoint(async (session) =>
    operation(requestRuntime.createClient(session, navigation.navigate))
  );

  return navigation.getTarget();
};

const destroyWithNavigation = async (
  requestRuntime: LogtoAuthRequestRuntime,
  operation: AuthOperation
) => {
  const navigation = new NavigationCapture();

  await requestRuntime.sessionRuntime.destroy(async (session) =>
    operation(requestRuntime.createClient(session, navigation.navigate))
  );

  return navigation.getTarget();
};

export const createAuthRoutes = ({ baseUrl, requestRuntimeContext }: CreateAuthRoutesOptions) => {
  return ({
    paths,
    postCallbackRedirectUri,
    postSignOutRedirectUri,
    validateActionRequest,
  }: AuthRoutesOptions): AuthRoutes => {
    const getPostCallbackRedirectUri = async (signInRequest: Request) => {
      if (typeof postCallbackRedirectUri === 'string') {
        // Static values are trusted configuration. Resolver output may derive from request input.
        return resolveUri(baseUrl, postCallbackRedirectUri);
      }

      return resolveReturnUri(baseUrl, await postCallbackRedirectUri(signInRequest));
    };

    const loader: AuthRouteLoader = async ({ request, context, url }) => {
      const { pathname } = url;

      if (pathname === paths.callback) {
        if (request.method !== 'GET') {
          return createMethodNotAllowedResponse('GET');
        }

        const requestRuntime = context.get(requestRuntimeContext);

        const navigation = new NavigationCapture();

        await requestRuntime.sessionRuntime.checkpoint(async (session) =>
          requestRuntime
            .createClient(session, navigation.navigate)
            .handleSignInCallback(getCallbackUri(baseUrl, paths.callback, request))
        );

        return redirect(navigation.getOptionalTarget() ?? resolveUri(baseUrl, '/'));
      }

      if (
        pathname === paths.signIn ||
        pathname === paths.signOut ||
        (paths.signUp && pathname === paths.signUp)
      ) {
        return createMethodNotAllowedResponse('POST');
      }

      return createNotFoundResponse();
    };

    const action: AuthRouteAction = async ({ request, context, url }) => {
      const { pathname } = url;

      if (pathname === paths.callback) {
        return createMethodNotAllowedResponse('GET');
      }

      if (
        pathname !== paths.signIn &&
        pathname !== paths.signOut &&
        (!paths.signUp || pathname !== paths.signUp)
      ) {
        return createNotFoundResponse();
      }

      if (request.method !== 'POST') {
        return createMethodNotAllowedResponse('POST');
      }

      const validationResponse = await validateActionRequest?.(request.clone());

      if (validationResponse) {
        return validationResponse;
      }

      const requestRuntime = context.get(requestRuntimeContext);

      if (pathname === paths.signIn) {
        const postRedirectUri = await getPostCallbackRedirectUri(request);
        const navigateTo = await checkpointWithNavigation(requestRuntime, async (client) =>
          client.signIn({
            redirectUri: resolveUri(baseUrl, paths.callback),
            postRedirectUri,
          })
        );

        return redirect(navigateTo);
      }

      if (paths.signUp && pathname === paths.signUp) {
        const postRedirectUri = await getPostCallbackRedirectUri(request);
        const navigateTo = await checkpointWithNavigation(requestRuntime, async (client) =>
          client.signIn({
            redirectUri: resolveUri(baseUrl, paths.callback),
            postRedirectUri,
            firstScreen: 'register',
          })
        );

        return redirect(navigateTo);
      }

      const navigateTo = await destroyWithNavigation(requestRuntime, async (client) =>
        client.signOut(resolveUri(baseUrl, postSignOutRedirectUri))
      );

      return redirect(navigateTo);
    };

    return Object.freeze({ loader, action });
  };
};
