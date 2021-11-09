export function niceTry(fn: () => void): void;
export function niceTry(fn: () => Promise<void>): Promise<void>;
export function niceTry(fn: (() => void)|(() => Promise<void>)): void|Promise<void> {
  try {
    const maybePromise = fn();

    if (maybePromise instanceof Promise) {
      return maybePromise.then(() => {}, () => {});
    }
  } catch {}
}