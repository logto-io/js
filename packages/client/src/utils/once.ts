type Procedure<T> = (...args: unknown[]) => T;

// TODO @sijie move to essentials
/* eslint-disable @silverhand/fp/no-let */
/* eslint-disable @silverhand/fp/no-mutation */
export function once<T>(function_: Procedure<T>): Procedure<T> {
  let called = false;
  let result: T;

  return function (this: unknown, ...args: unknown[]) {
    if (!called) {
      called = true;
      result = function_.apply(this, args);
    }

    return result;
  };
}
/* eslint-enable @silverhand/fp/no-mutation */
/* eslint-enable @silverhand/fp/no-let */
