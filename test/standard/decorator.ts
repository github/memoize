// Runs with standard (TC39) decorators: vitest.config.ts compiles test/standard with experimentalDecorators off.
import memoize from '../../decorator.js'
import {describe, it, expect} from 'vitest'

describe('memoize decorator (standard decorators)', () => {
  it('memoizes the method, keeping `this`', () => {
    class Incr {
      i = 1
      @memoize()
      incr(this: Incr, key: string) {
        return `${key}${this.i++}`
      }
    }
    const incr = new Incr()
    expect([incr.incr('a'), incr.incr('a')]).toEqual(['a1', 'a1'])
    expect([incr.incr('b'), incr.incr('b')]).toEqual(['b2', 'b2'])
  })

  it('uses the given hash and cache', () => {
    const cache = new Map<string, number>([['A', 5]])
    class Lookup {
      @memoize({hash: (key: string) => key.toUpperCase(), cache})
      len(key: string) {
        return key.length
      }
    }
    const lookup = new Lookup()
    expect(lookup.len('a')).toEqual(5)
    expect(lookup.len('bb')).toEqual(2)
    expect(cache.get('BB')).toEqual(2)
  })

  it('shares pending promises and evicts rejected ones', async () => {
    let calls = 0
    class Loader {
      @memoize()
      async load(id: number): Promise<number> {
        calls++
        throw new Error(`failed ${id}`)
      }
    }
    const loader = new Loader()
    const first = loader.load(1)
    expect(loader.load(1)).toBe(first)
    await expect(first).rejects.toThrow('failed 1')
    await expect(loader.load(1)).rejects.toThrow('failed 1')
    expect(calls).toEqual(2)
  })

  it('decorates static and private methods', () => {
    class Counter {
      static calls = 0
      calls = 0
      @memoize()
      static double(n: number) {
        Counter.calls++
        return n * 2
      }
      @memoize()
      #triple(n: number) {
        this.calls++
        return n * 3
      }
      triple(n: number) {
        return this.#triple(n)
      }
    }
    const counter = new Counter()
    expect([Counter.double(2), Counter.double(2)]).toEqual([4, 4])
    expect([counter.triple(2), counter.triple(2)]).toEqual([6, 6])
    expect([Counter.calls, counter.calls]).toEqual([1, 1])
  })

  it('shares one cache across instances', () => {
    class Named {
      constructor(private name: string) {}
      @memoize()
      greet(greeting: string) {
        return `${greeting} ${this.name}`
      }
    }
    expect(new Named('a').greet('hi')).toEqual('hi a')
    expect(new Named('b').greet('hi')).toEqual('hi a')
  })

  it('rejects members that are not methods', () => {
    expect(() => {
      class Field {
        // @ts-expect-error fields are not methods
        @memoize()
        foo = (key: string) => key
      }
      return Field
    }).toThrow('memoize can only decorate methods')
    expect(() => {
      class Getter {
        // @ts-expect-error getters are not methods
        @memoize()
        get foo() {
          return 1
        }
      }
      return Getter
    }).toThrow('memoize can only decorate methods')
  })
})
