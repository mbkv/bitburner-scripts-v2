export function tuple<T>(arg: T): [T];
export function tuple<T, T2>(arg: T, arg2: T2): [T, T2];
export function tuple(...args: unknown[]): unknown[] {
  return args
}