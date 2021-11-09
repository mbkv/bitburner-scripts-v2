export function repeat (amount: number, fn: () => unknown, promisify?: false): void;
export function repeat (amount: number, fn: () => Promise<unknown>, promisify: true): Promise<void>;
export function repeat (amount: number, fn: (() => void)|(() => Promise<void>), promisify = false): void|Promise<void> {
  let promise = Promise.resolve();
  for (let i = 0; i < amount; i++) {
    if (promisify) {
      promise = promise.then(() => fn());
    } else {
      fn();
    }
  }

  if (promisify) {
    return promise;
  }
}