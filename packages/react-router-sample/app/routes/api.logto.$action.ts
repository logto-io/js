import { applicationOrigin, logto } from '../services/auth.server';

const validateActionRequest = (request: Request) => {
  if (request.headers.get('Origin') !== applicationOrigin) {
    return new Response(null, { status: 403, statusText: 'Forbidden' });
  }
};

const authRoutes = logto.authRoutes({
  paths: {
    signIn: '/api/logto/sign-in',
    signUp: '/api/logto/sign-up',
    callback: '/api/logto/callback',
    signOut: '/api/logto/sign-out',
  },
  postCallbackRedirectUri: '/',
  postSignOutRedirectUri: '/',
  validateActionRequest,
});

export const loader = authRoutes.loader;
export const action = authRoutes.action;
