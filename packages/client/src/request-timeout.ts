const maximumRequestTimeout = 2_147_483_647;

export const assertRequestTimeout = (requestTimeoutMs?: number): void => {
  if (
    requestTimeoutMs !== undefined &&
    (!Number.isInteger(requestTimeoutMs) ||
      requestTimeoutMs <= 0 ||
      requestTimeoutMs > maximumRequestTimeout)
  ) {
    throw new TypeError('requestTimeoutMs must be an integer between 1 and 2147483647.');
  }
};
