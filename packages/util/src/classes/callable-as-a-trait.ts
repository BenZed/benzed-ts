import { assign, Func, isFunc, isIntersection, isShape, nil } from '../types'
import { Trait } from './trait'

import { Property } from '../property'

//// Symbols ////

export const $$signature = Symbol('callable-signature')

export const $$context = Symbol('callable-context')

//// Helper ////

function applyCallable<F extends Func>(input: Callable<F>): Callable<F> {

    // Validate Signature
    const signature = input[$$signature]

    if (!isFunc(signature))
        throw new Error('Signature must be a function.')

    // Create callable instance
    function callable(this: unknown, ...args: unknown[]): unknown {
        assign(callable, { [$$context]: this })
        return signature.apply(callable, args)
    }

    // Add Context Property
    Property.configure(callable, $$context, {
        value: nil,
        configurable: false,
        enumerable: false,
        writable: true
    })

    // Writable Name Property
    Property.configure(callable, 'name', {
        value: signature.name || input.constructor.name,
        writable: true,
        configurable: true
    })

    // Add instance properties
    Property.transpose(input, callable, [Object.prototype, Function.prototype])

    return callable as unknown as Callable<F>
}

//// Exports ////

abstract class Callable<F extends Func> extends Trait {

    static readonly signature: typeof $$signature = $$signature
    static readonly context: typeof $$context = $$context

    static readonly [Trait.apply] = applyCallable

    static override is = isIntersection(
        isFunc,
        isShape({
            [$$signature]: isFunc
        })
    )

    protected readonly [$$context]: unknown

    protected abstract get [$$signature](): F

}

export const CallableConstructor = Callable as unknown as (
    abstract new <F extends Func>() => Callable<F> & F
) & {

    /**
     * Implement this method on the callable instance
     * to retreive it's call signature
     */
    readonly signature: typeof $$signature

    /**
     * The outer 'this' of the calling signature
     */
    readonly context: typeof $$context

    is<F extends Func>(input: unknown): input is Callable<F>

}

export {
    CallableConstructor as Callable
}