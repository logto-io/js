import type { CreateLogtoClient } from './create-client.js';

type HandleSignOutRequest = {
  readonly redirectUri: string;
};

type HandleSignOutResponse = {
  readonly navigateToUrl: string;
};

class HandleSignOutCommand {
  public static readonly fromDependencies = (dependencies: { createClient: CreateLogtoClient }) =>
    new HandleSignOutCommand({ createClient: dependencies.createClient });

  private navigateToUrl = '/api/sign-in';

  private constructor(
    private readonly properties: {
      readonly createClient: CreateLogtoClient;
    }
  ) {}

  public async execute(request: HandleSignOutRequest) {
    const { createClient } = this.properties;

    const client = createClient((url) => {
      this.navigateToUrl = url;
    });

    await client.signOut(request.redirectUri);

    return {
      navigateToUrl: this.navigateToUrl,
    };
  }
}

export const makeHandleSignOut =
  (deps: { createClient: CreateLogtoClient }) =>
  async (request: HandleSignOutRequest): Promise<HandleSignOutResponse> => {
    const { createClient } = deps;

    const command = HandleSignOutCommand.fromDependencies({ createClient });

    return command.execute(request);
  };
