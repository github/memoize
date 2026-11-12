// Compile-time checks, run under both decorator modes: `tsc -p test/types` (experimentalDecorators) and
// `tsc -p test/standard` (standard decorators). Nothing here runs.
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

  @memoize({hash: () => 'constant'})
  ignoresArgs(key: string): string {
    return key
  }

  @memoize({hash: (...args: unknown[]) => JSON.stringify(args)})
  withReceiver(this: Example, key: string): number {
    return key.length + this.i
  }

  @memoize()
  static create(): Example {
    return new Example()
  }

  // @ts-expect-error `hash` must accept the method arguments
  @memoize({hash: (id: number) => id})
  byName(name: string): string {
    return name
  }

  // @ts-expect-error the cache must hold the method's return type
  @memoize({cache: new Map<string, string>()})
  count(key: string): number {
    return key.length
  }

  // @ts-expect-error fields are not methods
  @memoize()
  field = (key: string) => key

  // @ts-expect-error getters are not methods
  @memoize()
  get value(): number {
    return this.i
  }
}
