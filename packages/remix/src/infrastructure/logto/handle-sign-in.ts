import type { Session } from '@remix-run/node';

import type { CreateLogtoClient } from './create-client.js';
import type { LogtoStorage } from './create-storage.js';

type HandleSignInRequest = {
  readonly redirectUri: string;
};

type HandleSignInResponse = {
  readonly session: Session;
  readonly navigateToUrl: string;
};

class HandleSignInCommand {
  public static readonly fromDependencies = (dependencies: { createClient: CreateLogtoClient }) =>
    new HandleSignInCommand({ createClient: dependencies.createClient });

  private navigateToUrl = '/api/sign-in';

  private constructor(
    private readonly properties: {
      readonly createClient: CreateLogtoClient;
    }
  ) {}

  public async execute(request: HandleSignInRequest) {
    const { createClient } = this.properties;

    const client = createClient((url) => {
      this.navigateToUrl = url;
    });

    await client.signIn(request.redirectUri);

    return {
      navigateToUrl: this.navigateToUrl,
    };
  }
}

export const makeHandleSignIn =
  (deps: { storage: LogtoStorage; createClient: CreateLogtoClient }) =>
  async (request: HandleSignInRequest): Promise<HandleSignInResponse> => {
    const { storage, createClient } = deps;

    const command = HandleSignInCommand.fromDependencies({ createClient });

    const { navigateToUrl } = await command.execute(request);

    return {
      session: storage.session,
      navigateToUrl,
    };
  };
