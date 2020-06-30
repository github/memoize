import memo from './index'
import type {MemoizeOptions, MemoizableFunction} from './index'

export default function memoize<A extends unknown[], R, T>(memoizeOptions: MemoizeOptions<A, R> = {}) {
  return (target: T, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    descriptor.value = memo(descriptor.value as MemoizableFunction<A, R, T>, memoizeOptions)
    Object.defineProperty(target, propertyKey, descriptor)
  }
}
