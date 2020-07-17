export interface MemoizeOptions<A extends unknown[], R> {
  /**
   * Provides a single value to use as the Key for the memoization.
   * Defaults to `JSON.stringify` (ish).
   */
  hash?: (...args: A) => unknown

  /**
   * The Cache implementation to provide. Must be a Map or Map-alike.
   * Defaults to a Map. Useful for replacing the cache with an LRU cache or similar.
   */
  cache?: Map<unknown, R>
}

export type MemoizableFunction<A extends unknown[], R extends unknown, T extends unknown> = (this: T, ...args: A) => R

export function defaultHash(...args: unknown[]): string {
  // JSON.stringify ellides `undefined` and function values by default. We do not want that.
  return JSON.stringify(args, (_: unknown, v: unknown) => (typeof v === 'object' ? v : String(v)))
}

export default function memoize<A extends unknown[], R extends unknown, T extends unknown>(
  fn: MemoizableFunction<A, R, T>,
  opts: MemoizeOptions<A, R> = {}
): MemoizableFunction<A, R, T> {
  const {hash = defaultHash, cache = new Map()} = opts
  return function (this: T, ...args: A) {
    const id = hash.apply(this, args)
    if (cache.has(id)) return cache.get(id)
    let result = fn.apply(this, args)
    if (result instanceof Promise) {
      // eslint-disable-next-line github/no-then
      result = result.catch(error => {
        cache.delete(id)
        throw error
      })
    }
    cache.set(id, result)
    return result
  }
}
