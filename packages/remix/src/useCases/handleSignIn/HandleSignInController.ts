import type { TypedResponse } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { getCookieHeaderFromRequest } from '../../framework/get-cookie-header-from-request.js';

import type { HandleSignInUseCase } from './HandleSignInUseCase.js';

type HandleSignInControllerDto = {
  readonly redirectUri: string;
  readonly useCase: HandleSignInUseCase;
};

export class HandleSignInController {
  public static readonly fromDto = (dto: HandleSignInControllerDto) =>
    new HandleSignInController({
      useCase: dto.useCase,
      redirectUri: dto.redirectUri,
    });

  private readonly useCase = this.properties.useCase;
  private readonly redirectUri = this.properties.redirectUri;
  private constructor(
    private readonly properties: {
      redirectUri: string;
      useCase: HandleSignInUseCase;
    }
  ) {}

  public readonly execute = async (request: Request): Promise<TypedResponse<never>> => {
    const cookieHeader = getCookieHeaderFromRequest(request);
    const { redirectUri } = this;

    const result = await this.useCase({
      cookieHeader: cookieHeader ?? undefined,
      redirectUri,
    });

    return redirect(result.navigateToUrl, {
      headers: {
        'Set-Cookie': result.cookieHeader,
      },
    });
  };
}
