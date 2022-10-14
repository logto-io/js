import { LogtoContext } from '@logto/node';

import { getCookieHeaderFromRequest } from '../../framework/get-cookie-header-from-request';
import type { GetContextUseCase } from './GetContextUseCase';

type GetContextControllerDto = {
  readonly includeAccessToken?: boolean;
  readonly useCase: GetContextUseCase;
};

export class GetContextController {
  public static readonly fromDto = (dto: GetContextControllerDto) =>
    new GetContextController({
      useCase: dto.useCase,
      includeAccessToken: dto.includeAccessToken ?? false,
    });

  private readonly useCase = this.properties.useCase;
  private readonly includeAccessToken = this.properties.includeAccessToken;
  private constructor(
    private readonly properties: {
      includeAccessToken: boolean;
      useCase: GetContextUseCase;
    }
  ) {}

  public readonly execute = async (request: Request): Promise<LogtoContext> => {
    const cookieHeader = getCookieHeaderFromRequest(request);
    const { includeAccessToken } = this;

    const result = await this.useCase({
      cookieHeader: cookieHeader ?? undefined,
      includeAccessToken,
    });

    return result.context;
  };
}
