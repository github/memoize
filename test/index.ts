/* globals process */
import memoize from '../index.js'
import chai from 'chai'
import spies from 'chai-spies'
import chaiAsPromised from 'chai-as-promised'
chai.use(spies)
chai.use(chaiAsPromised)
const {expect, spy} = chai
const noop = () => null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const incr = (i: number) => (_: unknown): number => i++

describe('memoize', () => {
  let fn = spy(incr(1))
  let memoized = memoize(fn)
  beforeEach(() => {
    fn = spy(incr(1))
    memoized = memoize(fn)
  })

  it('calls the callback only once with repeated arguments', () => {
    expect([memoized(1), memoized(1), memoized(1), memoized(1)]).to.eql([1, 1, 1, 1])
    expect(fn).to.have.been.called.exactly(1).called.with.exactly(1)
  })

  it('calls the callback different times with different inputs', () => {
    expect([memoized(1), memoized(2), memoized(3), memoized(4)]).to.eql([1, 2, 3, 4])
    expect(fn)
      .to.have.been.called.exactly(4)
      .and.called.with.exactly(1)
      .and.called.with.exactly(2)
      .and.called.with.exactly(3)
      .and.called.with.exactly(4)
  })

  it('differentiates undefined/null/true/0/function', () => {
    const calls = [memoized(undefined), memoized(null), memoized(true), memoized(0), memoized(noop)]
    expect(calls).to.eql([1, 2, 3, 4, 5])
    expect(fn).to.have.been.called.exactly(5)
    expect(fn).to.have.been.called.with.exactly(undefined)
    expect(fn).to.have.been.called.with.exactly(null)
    expect(fn).to.have.been.called.with.exactly(true)
    expect(fn).to.have.been.called.with.exactly(0)
    expect(fn).to.have.been.called.with.exactly(noop)
  })

  describe('hash', () => {
    it('calls hash to get key for cache store', () => {
      let key = '1'
      const hash = spy(() => key)
      memoized = memoize(fn, {hash})
      expect([memoized(null), memoized(null)]).to.eql([1, 1])
      expect(fn).to.have.been.called.exactly(1)
      expect(hash).to.have.been.called.exactly(2)
      expect(hash).to.have.been.called.always.with.exactly(null)
      key = '2'
      expect(memoized(null)).to.equal(2)
      expect(fn).to.have.been.called.exactly(2)
    })
  })

  describe('cache option', () => {
    it('uses `has`/`get`/`set` on the Cache implementation', () => {
      const cache = new Map()
      spy.on(cache, ['get', 'set', 'has'])
      const key = {}
      const hash = spy(() => key)
      memoized = memoize(fn, {hash, cache})
      expect([memoized(null), memoized(null)]).to.eql([1, 1])
      expect(cache.has).to.have.been.called.exactly(2).called.with.exactly(key)
      expect(cache.get).to.have.been.called.exactly(1).called.with.exactly(key)
      expect(cache.set).to.have.been.called.exactly(1).called.with.exactly(key, 1)
    })

    it('calls `delete` to evict rejected Promises', async () => {
      process.on('unhandledRejection', noop)
      const cache = new Map()
      spy.on(cache, ['get', 'set', 'has', 'delete'])
      const key = {}
      const hash = spy(() => key)
      const reject = spy(() => Promise.reject(new Error('example')))
      memoized = memoize(reject, {hash, cache})
      expect(memoized(null)).to.be.a('promise')
      expect(cache.set).to.have.been.called.exactly(1).called.with(key)
      await Promise.resolve()
      expect(cache.delete).to.have.been.called.exactly(1).called.with.exactly(key)
      setTimeout(() => process.off('unhandledRejection', noop))
    })

    it('returns the same promise to new and memoized calls', () => {
      const cache = new Map()
      spy.on(cache, ['get', 'set', 'has', 'delete'])
      const key = {}
      const hash = spy(() => key)

      const asyncFn = spy(async function (cacheKey: string): Promise<string> {
        return new Promise<string>(resolveFn =>
          setTimeout(function () {
            resolveFn(cacheKey)
          }, 250)
        )
      })

      const m = memoize(asyncFn, {hash, cache})
      let calledCount = 0
      const p1 = m('1')
      const p2 = m('1')
      const p3 = m('1')

      expect(p2).to.equal(p1)
      expect(p3).to.equal(p1)

      expect(cache.set).to.have.been.called.exactly(1).called.with(key)

      // make sure promise 'then' order is kept
      return Promise.all([
        expect(
          p1.then(() => {
            const prevCalledCount = calledCount
            calledCount++
            return prevCalledCount
          })
        ).to.eventually.eq(0),
        expect(
          p2.then(() => {
            const prevCalledCount = calledCount
            calledCount++
            return prevCalledCount
          })
        ).to.eventually.eq(1),
        expect(
          p3.then(() => {
            const prevCalledCount = calledCount
            calledCount++
            return prevCalledCount
          })
        ).to.eventually.eq(2)
      ])
    })
  })
})
