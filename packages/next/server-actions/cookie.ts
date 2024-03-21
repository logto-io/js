import { type LogtoNextConfig } from '../src/types';

export const getCookies = async (config: LogtoNextConfig): Promise<string> => {
  const { cookies } = await import('next/headers');
  return cookies().get(`logto:${config.appId}`)?.value ?? '';
};

export const setCookies = async (newCookie: string, config: LogtoNextConfig): Promise<void> => {
  const { cookies } = await import('next/headers');
  cookies().set(`logto:${config.appId}`, newCookie, {
    maxAge: 14 * 3600 * 24,
    secure: config.cookieSecure,
    sameSite: config.cookieSecure ? 'lax' : undefined,
  });
};
