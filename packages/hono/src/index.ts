import { CookieStorage, type CookieConfig, type LogtoContext } from '@logto/node';
import NodeClient from '@logto/node/edge';
import { Hono, type Context, type MiddlewareHandler } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { CookieOptions } from 'hono/utils/cookie';

import type {
  AuthRouteFlow,
  HandleAuthRoutesOptions,
  LogtoHonoConfig,
  LogtoVariables,
} from './types.js';

export {
  CookieStorage,
  LogtoError,
  LogtoRequestError,
  LogtoClientError,
  OidcError,
  Prompt,
  ReservedScope,
  ReservedResource,
  UserScope,
  organizationUrnPrefix,
  buildOrganizationUrn,
  decodeAccessToken,
  getOrganizationIdFromUrn,
  CacheKey,
  PersistKey,
} from '@logto/node';

export type {
  AccessTokenClaims,
  IdTokenClaims,
  InteractionMode,
  LogtoConfig,
  LogtoContext,
  LogtoErrorCode,
  SignInOptions,
  Storage,
  StorageKey,
  UserInfoResponse,
} from '@logto/node';
export type {
  AuthRouteFlow,
  AuthRouteSignInOptions,
  GetSignInOptions,
  HandleAuthRoutesOptions,
  LogtoHonoConfig,
  LogtoVariables,
} from './types.js';

type LogtoEnv = { Variables: LogtoVariables };

type SetCookieOptions = Parameters<CookieConfig['setCookie']>[2];

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

class NavigationStore {
  url?: string;

  readonly navigate = (url: string): void => {
    this.url = url;
  };
}

class CookieBuffer {
  pending?: PendingCookie;

  readonly buffer = (cookie: PendingCookie): void => {
    this.pending = cookie;
  };

  readonly commit = (context: Context<LogtoEnv>): void => {
    if (this.pending) {
      setCookie(context, this.pending.name, this.pending.value, this.pending.options);
      this.pending = undefined;
    }
  };
}

const toCookieOptions = (options: SetCookieOptions): CookieOptions => {
  const { sameSite, ...rest } = options;

  return {
    ...rest,
    sameSite: sameSite === true ? 'lax' : sameSite === false ? undefined : sameSite,
  };
};

const createStorage = (context: Context<LogtoEnv>, config: LogtoHonoConfig) => {
  const cookies = new CookieBuffer();
  const storage = new CookieStorage({
    encryptionKey: config.encryptionKey,
    cookieKey: config.cookieKey,
    isSecure:
      context.req.header('x-forwarded-proto') === 'https' ||
      new URL(context.req.url).protocol === 'https:',
    getCookie: (name) => getCookie(context, name),
    setCookie: (name, value, options) => {
      cookies.buffer({ name, value, options: toCookieOptions(options) });
    },
  });

  return {
    storage,
    commitCookie: () => {
      cookies.commit(context);
    },
  };
};

const createClient = async (context: Context<LogtoEnv>, config: LogtoHonoConfig) => {
  const { storage, commitCookie } = createStorage(context, config);
  await storage.init();
  const navigation = new NavigationStore();

  const client = new NodeClient(config, {
    storage,
    navigate: navigation.navigate,
  });

  return {
    client,
    getNavigationUrl: () => navigation.url,
    commitCookie,
  };
};

const withClient = async <Result>(
  context: Context<LogtoEnv>,
  config: LogtoHonoConfig,
  handler: (client: NodeClient, getNavigationUrl: () => string | undefined) => Promise<Result>
): Promise<Result> => {
  const { client, getNavigationUrl, commitCookie } = await createClient(context, config);

  try {
    return await handler(client, getNavigationUrl);
  } finally {
    // `CookieStorage` writes on every storage change; only the final session state matters.
    commitCookie();
  }
};

const redirect = (context: Context<LogtoEnv>, url: string | undefined): Response => {
  if (!url) {
    throw new Error('Logto client did not provide a navigation URL.');
  }

  return context.redirect(url);
};

export const handleAuthRoutes = (
  config: LogtoHonoConfig,
  { getSignInOptions }: HandleAuthRoutesOptions = {}
): Hono<LogtoEnv> => {
  const app = new Hono<LogtoEnv>();
  const prefix = config.authRoutesPrefix ?? 'logto';
  const redirectUri = `${config.baseUrl}/${prefix}/sign-in-callback`;

  const signIn = async (context: Context<LogtoEnv>, flow: AuthRouteFlow) => {
    const requestOptions = await getSignInOptions?.(context, flow);

    const navigationUrl = await withClient(context, config, async (client, getNavigationUrl) => {
      await client.signIn({
        ...config.signInOptions,
        ...requestOptions,
        redirectUri,
        ...(flow === 'signUp' ? { firstScreen: 'register' as const } : {}),
      });

      return getNavigationUrl();
    });

    return redirect(context, navigationUrl);
  };

  app.get(`/${prefix}/sign-in`, async (context) => signIn(context, 'signIn'));

  app.get(`/${prefix}/sign-up`, async (context) => signIn(context, 'signUp'));

  app.get(`/${prefix}/sign-in-callback`, async (context) => {
    const { pathname, search } = new URL(context.req.url);

    await withClient(context, config, async (client) => {
      await client.handleSignInCallback(`${config.baseUrl}${pathname}${search}`);
    });

    return context.redirect(config.baseUrl);
  });

  app.get(`/${prefix}/sign-out`, async (context) => {
    const navigationUrl = await withClient(context, config, async (client, getNavigationUrl) => {
      await client.signOut(config.baseUrl);

      return getNavigationUrl();
    });

    return redirect(context, navigationUrl);
  });

  return app;
};

export const withLogto = (config: LogtoHonoConfig): MiddlewareHandler<LogtoEnv> =>
  createMiddleware<LogtoEnv>(async (context, next) => {
    const logto: LogtoContext = await withClient(context, config, async (client) =>
      client.getContext({
        getAccessToken: config.getAccessToken,
        resource: config.resource,
        fetchUserInfo: config.fetchUserInfo,
        getOrganizationToken: config.getOrganizationToken,
        organizationId: config.organizationId,
      })
    );

    context.set('logto', logto);

    await next();
  });
