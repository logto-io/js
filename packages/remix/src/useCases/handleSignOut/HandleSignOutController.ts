import type { TypedResponse } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { getCookieHeaderFromRequest } from '../../framework/get-cookie-header-from-request.js';

import { HandleSignOutError } from './HandleSignOutError.js';
import type { HandleSignOutUseCase } from './HandleSignOutUseCase.js';

type HandleSignOutControllerDto = {
  readonly useCase: HandleSignOutUseCase;
  readonly redirectUri: string;
};

export class HandleSignOutController {
  public static readonly fromDto = (dto: HandleSignOutControllerDto) =>
    new HandleSignOutController({
      useCase: dto.useCase,
      redirectUri: dto.redirectUri,
    });

  private readonly useCase = this.properties.useCase;
  private readonly redirectUri = this.properties.redirectUri;

  private constructor(
    private readonly properties: {
      useCase: HandleSignOutUseCase;
      redirectUri: string;
    }
  ) {}

  public readonly execute = async (request: Request): Promise<TypedResponse<never>> => {
    const cookieHeader = getCookieHeaderFromRequest(request);

    if (!cookieHeader) {
      throw HandleSignOutError.becauseNoCookieHeaderPresent();
    }

    const result = await this.useCase({
      cookieHeader,
      redirectUri: this.redirectUri,
    });

    return redirect(result.navigateToUrl, {
      headers: {
        'Set-Cookie': result.cookieHeader,
      },
    });
  };
}
