import { onceAsync } from './once.js';

describe('onceAsync', () => {
  it('should run the function only once and share the result', async () => {
    const run = vi.fn(async () => 'foo');
    const wrapped = onceAsync(run);

    const [result1, result2] = await Promise.all([wrapped(), wrapped()]);

    expect(run).toHaveBeenCalledTimes(1);
    expect(result1).toBe('foo');
    expect(result2).toBe('foo');

    await expect(wrapped()).resolves.toBe('foo');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('should retry after a rejection instead of replaying it', async () => {
    const run = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValue('foo');
    const wrapped = onceAsync(run);

    await expect(wrapped()).rejects.toThrow('Failed to fetch');
    expect(run).toHaveBeenCalledTimes(1);

    await expect(wrapped()).resolves.toBe('foo');
    expect(run).toHaveBeenCalledTimes(2);

    // The successful result should be cached again.
    await expect(wrapped()).resolves.toBe('foo');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('should share the same rejection between concurrent callers', async () => {
    const run = vi.fn(async () => {
      throw new Error('Failed to fetch');
    });
    const wrapped = onceAsync(run);

    const results = await Promise.allSettled([wrapped(), wrapped()]);

    expect(run).toHaveBeenCalledTimes(1);
    expect(results.every(({ status }) => status === 'rejected')).toBe(true);
  });

  it('should pass arguments and `this` to the wrapped function', async () => {
    const run = vi.fn(async function (this: unknown, value: string) {
      return { self: this, value };
    });
    const object = { wrapped: onceAsync(run) };

    await expect(object.wrapped('foo')).resolves.toStrictEqual({ self: object, value: 'foo' });
  });
});
