import NextAuth, { NextAuthResult } from 'next-auth';
import Logto from 'next-auth/providers/logto';

const result = NextAuth({
  providers: [
    Logto({
      authorization: {
        params: {
          // If you don't need to customize the scope, you can use the default scope by leaving the config empty.
          scope: 'openid offline_access profile email',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Inject the access token into the session object
      // @ts-expect-error
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

// A workaround to make the types work
// @see https://github.com/nextauthjs/next-auth/discussions/9950
export const handlers: NextAuthResult['handlers'] = result.handlers;
export const auth: NextAuthResult['auth'] = result.auth;
export const signIn: NextAuthResult['signIn'] = result.signIn;
export const signOut: NextAuthResult['signOut'] = result.signOut;
