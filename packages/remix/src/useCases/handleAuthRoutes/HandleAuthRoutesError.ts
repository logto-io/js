export class HandleAuthRoutesError extends Error {
  public static readonly becauseNoConfigForPath = (anticipatedPath: string) =>
    new HandleAuthRoutesError({
      code: 1_665_388_277,
      message: `No configuration available for path "${anticipatedPath}".`,
    });

  public static readonly becauseOfUnknownRoute = (anticipatedConfigKey: string) =>
    new HandleAuthRoutesError({
      code: 1_665_388_278,
      message: `The config key "${anticipatedConfigKey}" is invalid.`,
    });

  public readonly code = this.properties.code;
  public readonly cause = this.properties.cause;
  public readonly plainMessage = this.properties.message;

  private constructor(
    private readonly properties: {
      readonly code: number;
      readonly message: string;
      readonly cause?: Error;
    }
  ) {
    super(`#[${properties.code}] ${properties.message}`);
  }
}
