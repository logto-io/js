import type { GetContextParameters, LogtoContext } from '@logto/node';

import { getCookieHeaderFromRequest } from '../../framework/get-cookie-header-from-request.js';

import type { GetContextUseCase } from './GetContextUseCase.js';

type GetContextControllerDto = GetContextParameters & {
  readonly useCase: GetContextUseCase;
};

export class GetContextController {
  public static readonly fromDto = (dto: GetContextControllerDto) => new GetContextController(dto);

  private readonly useCase = this.properties.useCase;
  private constructor(
    private readonly properties: GetContextParameters & {
      useCase: GetContextUseCase;
    }
  ) {}

  public readonly execute = async (request: Request): Promise<LogtoContext> => {
    const cookieHeader = getCookieHeaderFromRequest(request);

    const result = await this.useCase({
      cookieHeader: cookieHeader ?? undefined,
      ...this.properties,
    });

    return result.context;
  };
}
