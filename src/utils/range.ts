export function *range(end: number): Generator<number> {
  for (let i = 0; i < end; i++) {
    yield i;
  }
}