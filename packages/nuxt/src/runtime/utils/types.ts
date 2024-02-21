// eslint-disable-next-line unused-imports/no-unused-imports -- used in comments
import type { LogtoConfig, CookieConfig } from '@logto/node';

export type DeepPartial<T> = T extends Record<string, unknown>
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type LogtoModuleOptions = {
  /**
   * The name to use when storing the Logto cookie.
   *
   * @see {@link CookieConfig.cookieKey} for the default value.
   */
  cookieName?: string;
  /**
   * If Logto should fetch from the [userinfo endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
   * when the user is signed in. This is useful when you need to fetch additional claims like `custom_data`.
   */
  fetchUserInfo: boolean;
  postCallbackRedirectUri: string;
  postLogoutRedirectUri: string;
  pathnames: {
    signIn: string;
    signOut: string;
    callback: string;
  };
};

export type LogtoRuntimeConfig = LogtoModuleOptions & {
  cookieEncryptionKey: string;
} & Omit<LogtoConfig, 'appSecret'> & { appSecret: NonNullable<LogtoConfig['appSecret']> };

export type LogtoRuntimeConfigInput = DeepPartial<LogtoRuntimeConfig>;
