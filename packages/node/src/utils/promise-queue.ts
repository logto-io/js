/**
 * A simple promise queue that processes tasks sequentially in the order they are enqueued.
 */
export class PromiseQueue {
  private readonly queue: Array<() => Promise<unknown>> = [];
  private processing = false;

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // Wrap the task along with its resolve and reject callbacks
      const wrappedTask = async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };

      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      this.queue.push(wrappedTask);

      if (!this.processing) {
        void this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.processing) {
      return;
    }
    this.processing = true;

    while (this.queue.length > 0) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      const task = this.queue.shift();
      if (task) {
        // eslint-disable-next-line no-await-in-loop
        await task();
      }
    }

    this.processing = false;
  }
}
