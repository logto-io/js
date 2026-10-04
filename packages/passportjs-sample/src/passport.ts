import passport from 'passport';
import OpenIDConnectStrategy, { type Profile, type VerifyCallback } from 'passport-openidconnect';

import { config } from './config.js';

const { appId, appSecret, endpoint } = config;

export default function initPassport() {
  passport.use(
    new OpenIDConnectStrategy(
      {
        issuer: `${endpoint}/oidc`,
        authorizationURL: `${endpoint}/oidc/auth`,
        tokenURL: `${endpoint}/oidc/token`,
        userInfoURL: `${endpoint}/oidc/me`,
        clientID: appId,
        clientSecret: appSecret,
        callbackURL: '/callback',
        scope: ['profile', 'offline_access'],
      },
      (issuer: string, profile: Profile, callback: VerifyCallback) => {
        callback(null, profile);
      }
    )
  );

  passport.serializeUser((user, callback) => {
    callback(null, user);
  });

  passport.deserializeUser(function (user, callback) {
    // eslint-disable-next-line no-restricted-syntax
    callback(null, user as Express.User);
  });
}
