import { PromiseQueue } from './promise-queue.js';

/* eslint-disable @silverhand/fp/no-mutating-methods */
describe('PromiseQueue', () => {
  it('should process tasks sequentially in the order they are enqueued', async () => {
    const queue = new PromiseQueue();
    const results: number[] = [];

    const task = (value: number) => async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1);
      });
      results.push(value);
    };

    await Promise.all([queue.enqueue(task(1)), queue.enqueue(task(2)), queue.enqueue(task(3))]);

    expect(results).toEqual([1, 2, 3]);
  });

  it('should process tasks sequentially in the order they are enqueued even if the tasks are rejected', async () => {
    const queue = new PromiseQueue();
    const results: number[] = [];
    const errors: unknown[] = [];

    const task = (value: number) => async () => {
      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (value === 2) {
              reject(new Error('Task 2 failed'));
            } else {
              resolve(null);
            }
          }, 1);
        });

        results.push(value);
      } catch (error) {
        errors.push(error);
      }
    };

    await Promise.all([
      queue.enqueue(task(1)),
      queue.enqueue(task(2)),
      queue.enqueue(task(3)),
      queue.enqueue(task(4)),
    ]);

    expect(results).toEqual([1, 3, 4]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect((errors[0] as Error).message).toBe('Task 2 failed');
  });
});
/* eslint-enable @silverhand/fp/no-mutating-methods */
