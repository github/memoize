import memoize from '../decorator.js'
import {describe, it, expect} from 'vitest'

describe('memoize decorator', () => {
  it('works when called with no arguments', () => {
    class Incr {
      i: number
      constructor(i = 1) {
        this.i = i
      }
      @memoize()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      incr(_: unknown) {
        return this.i++
      }
    }
    const incr = new Incr()
    expect([incr.incr('a'), incr.incr('a')]).toEqual([1, 1])
    expect([incr.incr('b'), incr.incr('b')]).toEqual([2, 2])
  })

  it('works with given hash option', () => {
    let key = 'a'
    const hash = () => key
    class Incr {
      i: number
      constructor(i = 1) {
        this.i = i
      }
      @memoize({hash})
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      incr(_: unknown) {
        return this.i++
      }
    }
    const incr = new Incr()
    expect([incr.incr('a'), incr.incr('b')]).toEqual([1, 1])
    key = 'b'
    expect([incr.incr('a'), incr.incr('b')]).toEqual([2, 2])
  })

  it('works with given hash option', () => {
    const cache = new Map()
    const hash = (...args: unknown[]) => JSON.stringify(args)
    cache.set(hash('a'), 1)
    cache.set(hash('b'), 1)
    class Incr {
      i: number
      constructor(i = 1) {
        this.i = i
      }
      @memoize({cache})
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      incr(_: unknown) {
        return this.i++
      }
    }
    const incr = new Incr()
    expect([incr.incr('a'), incr.incr('b')]).toEqual([1, 1])
    cache.set(hash('a'), 2)
    cache.set(hash('b'), 2)
    expect([incr.incr('a'), incr.incr('b')]).toEqual([2, 2])
  })

  // Standard (TC39) decorators receive the method and a context object. The test build uses
  // `experimentalDecorators`, so these call the decorator the way the standard runtime does.
  describe('standard decorators', () => {
    const methodContext = {kind: 'method', name: 'incr', static: false, private: false} as ClassMethodDecoratorContext

    it('memoizes the method, keeping `this`', () => {
      class Incr {
        i = 1
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        incr(_: unknown) {
          return this.i++
        }
      }
      const incr = new Incr()
      const memoized = memoize()(Incr.prototype.incr, methodContext)
      expect([memoized.call(incr, 'a'), memoized.call(incr, 'a')]).toEqual([1, 1])
      expect([memoized.call(incr, 'b'), memoized.call(incr, 'b')]).toEqual([2, 2])
    })

    it('uses the given cache', () => {
      const cache = new Map()
      cache.set(JSON.stringify(['a']), 5)
      const one = (key: string) => key.length
      const memoized = memoize({cache})(one, methodContext)
      expect(memoized('a')).toEqual(5)
    })

    it('rejects members that are not methods', () => {
      const field: unknown = {kind: 'field', name: 'incr', static: false, private: false}
      expect(() => memoize()(() => 1, field as ClassMethodDecoratorContext)).toThrow(
        'memoize can only decorate methods',
      )
    })
  })
})
