import { redirect } from 'react-router';

import { getCookieHeaderFromRequest } from '../../framework/get-cookie-header-from-request.js';

import type { HandleSignUpUseCase } from './HandleSignUpUseCase.js';

type HandleSignUpControllerDto = {
  readonly redirectUri: string;
  readonly useCase: HandleSignUpUseCase;
};

export class HandleSignUpController {
  public static readonly fromDto = (dto: HandleSignUpControllerDto) =>
    new HandleSignUpController({
      useCase: dto.useCase,
      redirectUri: dto.redirectUri,
    });

  private readonly useCase = this.properties.useCase;
  private readonly redirectUri = this.properties.redirectUri;
  private constructor(
    private readonly properties: {
      redirectUri: string;
      useCase: HandleSignUpUseCase;
    }
  ) {}

  public readonly execute = async (request: Request): Promise<Response> => {
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
