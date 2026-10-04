import type { Session } from '@remix-run/node';

import type { CreateLogtoClient } from './create-client.js';
import type { LogtoStorage } from './create-storage.js';

type HandleSignUpRequest = {
  readonly redirectUri: string;
};

type HandleSignUpResponse = {
  readonly session: Session;
  readonly navigateToUrl: string;
};

class HandleSignUpCommand {
  public static readonly fromDependencies = (dependencies: { createClient: CreateLogtoClient }) =>
    new HandleSignUpCommand({ createClient: dependencies.createClient });

  private navigateToUrl = '/api/sign-up';

  private constructor(
    private readonly properties: {
      readonly createClient: CreateLogtoClient;
    }
  ) {}

  public async execute(request: HandleSignUpRequest) {
    const { createClient } = this.properties;

    const client = createClient((url) => {
      this.navigateToUrl = url;
    });

    await client.signIn({ redirectUri: request.redirectUri, interactionMode: 'signUp' });

    return {
      navigateToUrl: this.navigateToUrl,
    };
  }
}

export const makeHandleSignUp =
  (deps: { storage: LogtoStorage; createClient: CreateLogtoClient }) =>
  async (request: HandleSignUpRequest): Promise<HandleSignUpResponse> => {
    const { storage, createClient } = deps;

    const command = HandleSignUpCommand.fromDependencies({ createClient });

    const { navigateToUrl } = await command.execute(request);

    return {
      session: storage.session,
      navigateToUrl,
    };
  };
