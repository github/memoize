/* globals process */
import memoize from '../index.js'
import {describe, it, beforeEach, expect, vi} from 'vitest'
const noop = () => null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const incr = (i: number) => (_: unknown): number => i++

describe('memoize', () => {
  let fn = vi.fn(incr(1))
  let memoized = memoize(fn)
  beforeEach(() => {
    fn = vi.fn(incr(1))
    memoized = memoize(fn)
  })

  it('calls the callback only once with repeated arguments', () => {
    expect([memoized(1), memoized(1), memoized(1), memoized(1)]).toEqual([1, 1, 1, 1])
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('calls the callback different times with different inputs', () => {
    expect([memoized(1), memoized(2), memoized(3), memoized(4)]).toEqual([1, 2, 3, 4])
    expect(fn).toHaveBeenCalledTimes(4)
    expect(fn).toHaveBeenCalledWith(1)
    expect(fn).toHaveBeenCalledWith(2)
    expect(fn).toHaveBeenCalledWith(3)
    expect(fn).toHaveBeenCalledWith(4)
  })

  it('differentiates undefined/null/true/0/function', () => {
    const calls = [memoized(undefined), memoized(null), memoized(true), memoized(0), memoized(noop)]
    expect(calls).toEqual([1, 2, 3, 4, 5])
    expect(fn).toHaveBeenCalledTimes(5)
    expect(fn).toHaveBeenCalledWith(undefined)
    expect(fn).toHaveBeenCalledWith(null)
    expect(fn).toHaveBeenCalledWith(true)
    expect(fn).toHaveBeenCalledWith(0)
    expect(fn).toHaveBeenCalledWith(noop)
  })

  it('returns the same Promise when called multiple times', async () => {
    const memoized = memoize(a => Promise.resolve(a))
    const p1 = memoized('1')
    const p2 = memoized('1')
    const p3 = memoized('1')
    expect(p2).toBe(p1)
    expect(p3).toBe(p1)
  })

  it('does not catch promises as a side-effect', async () => {
    let failed = false
    function setFailed() {
      failed = true
    }
    process.on('unhandledRejection', setFailed)
    const error = new Error('Rejected promise')
    const memoized = memoize(() => Promise.reject(error))
    let rejected = false
    try {
      await memoized()
    } catch (e) {
      if (e === error) {
        rejected = true
      } else {
        throw e
      }
    }
    expect(rejected).toBe(true)
    await new Promise(setImmediate)
    expect(failed).toBe(false)
    process.off('unhandledRejection', setFailed)
  })

  describe('hash', () => {
    it('calls hash to get key for cache store', () => {
      let key = '1'
      const hash = vi.fn(() => key)
      memoized = memoize(fn, {hash})
      expect([memoized(null), memoized(null)]).toEqual([1, 1])
      expect(fn).toHaveBeenCalledTimes(1)
      expect(hash).toHaveBeenCalledTimes(2)
      expect(hash).toHaveBeenCalledWith(null)
      key = '2'
      expect(memoized(null)).toBe(2)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('cache option', () => {
    it('uses `has`/`get`/`set` on the Cache implementation', () => {
      const cache = new Map()
      const hasSpy = vi.spyOn(cache, 'has')
      const getSpy = vi.spyOn(cache, 'get')
      const setSpy = vi.spyOn(cache, 'set')
      const key = {}
      const hash = vi.fn(() => key)
      memoized = memoize(fn, {hash, cache})
      expect([memoized(null), memoized(null)]).toEqual([1, 1])
      expect(hasSpy).toHaveBeenCalledTimes(2)
      expect(hasSpy).toHaveBeenCalledWith(key)
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(getSpy).toHaveBeenCalledWith(key)
      expect(setSpy).toHaveBeenCalledTimes(1)
      expect(setSpy).toHaveBeenCalledWith(key, 1)
    })

    it('calls `delete` to evict rejected Promises', async () => {
      process.on('unhandledRejection', noop)
      const cache = new Map()
      const setSpy = vi.spyOn(cache, 'set')
      const deleteSpy = vi.spyOn(cache, 'delete')
      const key = {}
      const hash = vi.fn(() => key)
      const reject = vi.fn(() => Promise.reject(new Error('example')))
      memoized = memoize(reject, {hash, cache})
      expect(memoized(null)).toBeInstanceOf(Promise)
      expect(setSpy).toHaveBeenCalledTimes(1)
      expect(setSpy).toHaveBeenCalledWith(key, expect.any(Promise))
      await Promise.resolve()
      expect(deleteSpy).toHaveBeenCalledTimes(1)
      expect(deleteSpy).toHaveBeenCalledWith(key)
      setTimeout(() => process.off('unhandledRejection', noop))
    })
  })
})
