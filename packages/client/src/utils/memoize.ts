export function memoize<Args extends unknown[], Return>(run: (...args: Args) => Promise<Return>) {
  const promiseCache = new Map<unknown, Promise<Return>>();

  const memoized = async function (this: unknown, ...args: Args): Promise<Return> {
    const promiseKey = args[0];
    const cachedPromise = promiseCache.get(promiseKey);

    if (cachedPromise) {
      return cachedPromise;
    }

    const promise = (async () => {
      try {
        return await run.apply(this, args);
      } finally {
        promiseCache.delete(promiseKey);
      }
    })();

    promiseCache.set(promiseKey, promise);

    return promise;
  };

  return memoized;
}
