/* Copied from react-i18next/ts4.1/index.d.ts */
// Normalize single namespace
type AppendKeys<K1, K2> = `${K1 & string}.${K2 & string}`;
type AppendKeys2<K1, K2> = `${K1 & string}.${Exclude<K2, keyof any[]> & string}`;
type Normalize2<T, K = keyof T> = K extends keyof T
  ? T[K] extends Record<string, any>
    ? T[K] extends readonly any[]
      ? AppendKeys2<K, keyof T[K]> | AppendKeys2<K, Normalize2<T[K]>>
      : AppendKeys<K, keyof T[K]> | AppendKeys<K, Normalize2<T[K]>>
    : never
  : never;
type Normalize<T> = keyof T | Normalize2<T>;

const logtoErrorCodes = Object.freeze({
  idToken: {
    verification: {
      invalidIat: 'Invalid issued at time',
    },
  },
});

export type LogtoErrorCode = Normalize<typeof logtoErrorCodes>;

export class LogtoError extends Error {
  code: LogtoErrorCode;

  constructor(code: LogtoErrorCode) {
    super(code);
    this.code = code;
  }
}
