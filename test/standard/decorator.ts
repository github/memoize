// Type-checks standard (TC39) decorator usage. The main build and tests use `experimentalDecorators`.
import memoize from '../../decorator.js'

export class Example {
  i = 0

  @memoize()
  next(key: string): number {
    return key.length + this.i++
  }

  @memoize({hash: (id: number) => id, cache: new Map<number, Promise<string>>()})
  async load(id: number): Promise<string> {
    return String(id)
  }
}
