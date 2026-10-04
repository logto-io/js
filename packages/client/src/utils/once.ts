/* eslint-disable @silverhand/fp/no-let */
/* eslint-disable @silverhand/fp/no-mutation */
/**
 * Run the given async function at most once and cache its promise, so that all callers share the
 * same result.
 *
 * Unlike a plain `once()`, the cache is cleared when the promise rejects. Otherwise a single
 * failure (e.g. the device was offline when the function was first called) would be replayed to
 * every later caller for the lifetime of the cache, with no way to recover.
 */
export function onceAsync<Args extends unknown[], Return>(
  run: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  let cached: Promise<Return> | undefined;

  return async function (this: unknown, ...args: Args): Promise<Return> {
    const promise = cached ?? run.apply(this, args);
    cached = promise;

    try {
      return await promise;
    } catch (error: unknown) {
      // Allow the next caller to retry instead of replaying this failure forever. The identity
      // check keeps a newer promise (started by another caller) intact.
      if (cached === promise) {
        cached = undefined;
      }

      throw error;
    }
  };
}
/* eslint-enable @silverhand/fp/no-mutation */
/* eslint-enable @silverhand/fp/no-let */
