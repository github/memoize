# memoize

This is a package which provides a [`memoize`](https://en.wikipedia.org/wiki/Memoization) function, as well as a TypeScript
decorator which will [memoize](https://en.wikipedia.org/wiki/Memoization) a class method.

### Usage

```typescript
import memoize from '@github/memoize'

const fn = memoize(function doExpensiveStuff() {
  // Here's where you do expensive stuff!
})

const other = memoize(function doExpensiveStuff() {}, { 
  cache: new Map(), // pass your own cache implementation
  hash: JSON.stringify // pass your own hashing implementation
})
```

#### Options:

 - `hash?: (...args: A) => unknown`
   Provides a single value to use as the Key for the memoization.
   Defaults to `JSON.stringify` (ish).
 - `cache?: Map<unknown, R>`
   The Cache implementation to provide. Must be a Map or Map-alike. Defaults to a Map.
   Useful for replacing the cache with an LRU cache or similar.

### TypeScript Decorators Support!

This package also includes a decorator module which can be used to provide [TypeScript Decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#decorators) annotations to functions.

Here's an example, showing what you need to do:

```typescript
import memoize from '@github/memoize/decorator'
//                                  ^ note: add `/decorator` to the import to get decorators

class MyClass {
  @memoize() // Memoize the method below
  doThings() {
  }
}

const cache = new Map()
class MyClass {
  @memoize({ cache }) // Pass options just like the memoize function
  doThings() {
  }
}
```

### Why not just use package X?

Many memoize implementations exist. This one provides all of the utility we need at [GitHub](https://github.com/github) and nothing more. We've used a few various implementations in the past, here are some good ones:

 - [memoize](https://www.npmjs.com/package/memoize)
 - [mem](https://www.npmjs.com/package/mem)
 - [lodash.memoize](https://www.npmjs.com/package/lodash.memoize)
 
### Development

```
npm install
npm test
```

### License

Distributed under the MIT license. See LICENSE for details.
