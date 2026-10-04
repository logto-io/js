export class HandleSignOutError extends Error {
  public static readonly becauseNoCookieHeaderPresent = () =>
    new HandleSignOutError({
      code: 1_665_388_713,
      message: `The authentication sign-out route can't be accessed without a valid cookie.`,
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
