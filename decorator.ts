import memo from './index.js'
import type {MemoizeOptions, MemoizableFunction} from './index.js'

/**
 * The parts of a standard decorator's `ClassMethodDecoratorContext` used here. Declared structurally so these
 * types also load in TypeScript versions before 5.0, which lack the standard decorator types.
 */
export interface MethodDecoratorContext {
  readonly kind: 'method'
  readonly name: string | symbol
}

// `unknown` when `hash` can be called with the method's arguments. Otherwise an object type that the decorator's
// arguments can't satisfy, so a mismatched `hash` fails at the decorator and the error names the method's arguments.
type HashAccepts<A extends unknown[], F> = F extends (...args: infer P) => unknown
  ? ((...args: A) => unknown) extends (...args: P) => unknown
    ? unknown
    : {'`hash` must accept the method arguments': P}
  : unknown

/**
 * A method decorator that works with both TypeScript's legacy `experimentalDecorators` and standard (TC39)
 * decorators.
 */
export interface MemoizeDecorator<A extends unknown[], R, T> {
  <F extends (...args: never[]) => R>(method: F, context: MethodDecoratorContext & HashAccepts<A, F>): F
  <F extends (...args: never[]) => R>(
    target: T,
    propertyKey: (string | symbol) & HashAccepts<A, F>,
    descriptor: TypedPropertyDescriptor<F>,
  ): void
}

export default function memoize<A extends unknown[], R, T>(
  memoizeOptions: MemoizeOptions<A, R> = {},
): MemoizeDecorator<A, R, T> {
  return ((targetOrMethod: unknown, keyOrContext: unknown, descriptor?: PropertyDescriptor) => {
    // Standard decorators pass the method and a context object; legacy decorators pass the prototype, the
    // member name and its property descriptor.
    if (typeof keyOrContext === 'object' && keyOrContext !== null) {
      const context = keyOrContext as {kind?: unknown}
      if (context.kind !== 'method' || typeof targetOrMethod !== 'function') {
        throw new Error('memoize can only decorate methods')
      }
      return memo(targetOrMethod as MemoizableFunction<A, R, T>, memoizeOptions)
    }
    descriptor!.value = memo(descriptor!.value as MemoizableFunction<A, R, T>, memoizeOptions)
    Object.defineProperty(targetOrMethod, keyOrContext as string | symbol, descriptor!)
    return undefined
  }) as MemoizeDecorator<A, R, T>
}
