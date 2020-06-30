import memoize from '../decorator'
import {describe, it} from 'mocha'
import chai from 'chai'
import spies from 'chai-spies'
chai.use(spies)
const {expect} = chai

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
    expect([incr.incr('a'), incr.incr('a')]).to.eql([1, 1])
    expect([incr.incr('b'), incr.incr('b')]).to.eql([2, 2])
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
    expect([incr.incr('a'), incr.incr('b')]).to.eql([1, 1])
    key = 'b'
    expect([incr.incr('a'), incr.incr('b')]).to.eql([2, 2])
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
    expect([incr.incr('a'), incr.incr('b')]).to.eql([1, 1])
    cache.set(hash('a'), 2)
    cache.set(hash('b'), 2)
    expect([incr.incr('a'), incr.incr('b')]).to.eql([2, 2])
  })
})
