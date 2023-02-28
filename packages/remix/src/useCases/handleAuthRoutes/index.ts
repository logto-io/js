import type { LoaderFunction, SessionStorage } from '@remix-run/node';

import type { CreateLogtoAdapter } from '../../infrastructure/logto';
import { makeHandleSignIn } from '../handleSignIn';
import { makeHandleSignInCallback } from '../handleSignInCallback';
import { makeHandleSignOut } from '../handleSignOut';
import { HandleAuthRoutesError } from './HandleAuthRoutesError';

type AuthRouteConfig = {
  readonly path: string;
  readonly redirectBackTo: string;
};

type PossibleRouteTypes = 'sign-in' | 'sign-in-callback' | 'sign-out';

type HandleAuthRoutesDto = Record<PossibleRouteTypes, AuthRouteConfig>;

type MakeHandleAuthRoutesDto = {
  readonly baseUrl: string;
  readonly createLogtoAdapter: CreateLogtoAdapter;
  readonly sessionStorage: SessionStorage;
};

export const makeHandleAuthRoutes =
  (deps: MakeHandleAuthRoutesDto) =>
  (dto: HandleAuthRoutesDto): LoaderFunction =>
  async ({ request }) => {
    const anticipatedPath = new URL(request.url).pathname;

    /* eslint-disable no-restricted-syntax */
    const configKey = Object.keys(dto).find(
      (type) => dto[type as PossibleRouteTypes].path === anticipatedPath
    ) as keyof HandleAuthRoutesDto;

    const configExists = Boolean(configKey);
    /* eslint-enable no-restricted-syntax */

    if (!configExists) {
      throw HandleAuthRoutesError.becauseNoConfigForPath(anticipatedPath);
    }

    const { sessionStorage, createLogtoAdapter, baseUrl } = deps;

    const config = dto[configKey];

    switch (configKey) {
      case 'sign-in': {
        const handler = makeHandleSignIn(
          {
            redirectBackTo: `${baseUrl}${config.redirectBackTo}`,
          },
          { sessionStorage, createLogtoAdapter }
        );

        return handler(request);
      }

      case 'sign-in-callback': {
        const handler = makeHandleSignInCallback(
          {
            redirectBackTo: `${baseUrl}${config.redirectBackTo}`,
          },
          { sessionStorage, createLogtoAdapter }
        );

        return handler(request);
      }

      case 'sign-out': {
        const handler = makeHandleSignOut(
          {
            redirectBackTo: `${baseUrl}${config.redirectBackTo}`,
          },
          { sessionStorage, createLogtoAdapter }
        );

        return handler(request);
      }

      default: {
        throw HandleAuthRoutesError.becauseOfUnknownRoute(configKey);
      }
    }
  };
