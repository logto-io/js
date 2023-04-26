import type { TypedResponse } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { getCookieHeaderFromRequest } from '../../framework/get-cookie-header-from-request.js';

import { HandleSignInCallbackError } from './HandleSignInCallbackError.js';
import type { HandleSignInCallbackUseCase } from './HandleSignInCallbackUseCase.js';

type HandleSignInCallbackControllerDto = {
  readonly useCase: HandleSignInCallbackUseCase;
  readonly redirectUri: string;
};

export class HandleSignInCallbackController {
  public static readonly fromDto = (dto: HandleSignInCallbackControllerDto) =>
    new HandleSignInCallbackController({
      useCase: dto.useCase,
      redirectUri: dto.redirectUri,
    });

  private readonly useCase = this.properties.useCase;
  private readonly redirectUri = this.properties.redirectUri;

  private constructor(
    private readonly properties: {
      useCase: HandleSignInCallbackUseCase;
      redirectUri: string;
    }
  ) {}

  public readonly execute = async (request: Request): Promise<TypedResponse<never>> => {
    const cookieHeader = getCookieHeaderFromRequest(request);

    if (!cookieHeader) {
      throw HandleSignInCallbackError.becauseNoCookieHeaderPresent();
    }

    // In some scenarios, like performing the sign-in callback within a Gitpod
    // environment, the load balancer rewrites the URL and uses `http` as the
    // protocol. Here, we make sure that when the `x-forwarded-proto` HTTP header
    // is present, we will replace `http` with `https` in the `callbackUri`.
    const isForwardedHttpsTraffic = request.headers.get('x-forwarded-proto') === 'https';

    const callbackUri = isForwardedHttpsTraffic
      ? request.url.replace('http', 'https')
      : request.url;

    const result = await this.useCase({
      cookieHeader,
      callbackUri,
    });

    return redirect(this.redirectUri, {
      headers: {
        'Set-Cookie': result.cookieHeader,
      },
    });
  };
}
