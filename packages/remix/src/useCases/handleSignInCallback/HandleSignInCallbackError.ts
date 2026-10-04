export class HandleSignInCallbackError extends Error {
  public static readonly becauseNoCookieHeaderPresent = () =>
    new HandleSignInCallbackError({
      code: 1_665_388_541,
      message: `The authentication sign-in callback route can't be accessed without a valid cookie.`,
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
