import { logto } from '../services/auth.server';

const authRoutes = logto.authRoutes({
  paths: {
    signIn: '/api/logto/sign-in',
    signUp: '/api/logto/sign-up',
    callback: '/api/logto/callback',
    signOut: '/api/logto/sign-out',
  },
  postCallbackRedirectUri: '/',
  postSignOutRedirectUri: '/',
});

export const loader = authRoutes.loader;
export const action = authRoutes.action;
