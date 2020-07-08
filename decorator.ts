import memo from './index.js'
import type {MemoizeOptions, MemoizableFunction} from './index.js'

export default function memoize<A extends unknown[], R, T>(memoizeOptions: MemoizeOptions<A, R> = {}) {
  return (target: T, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    descriptor.value = memo(descriptor.value as MemoizableFunction<A, R, T>, memoizeOptions)
    Object.defineProperty(target, propertyKey, descriptor)
  }
}
