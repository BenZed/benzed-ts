import { define, assign, Func, isFunc, isIntersection, isShape, isKeyed, isObject, each } from '@benzed/util'
import { Trait } from '../trait'

//// Symbols ////

const $$signature = Symbol('callable-signature')

const $$context = Symbol('callable-context')

//// Helper ////

function isInstanceOfCallable(this: Func, instance: unknown): boolean {

    if (!isObject(instance) || !isFunc(instance?.constructor))
        return false 

    if (Object.is(instance.constructor, this))
        return true

    if (each.prototypeOf(instance.constructor).toArray().includes(this))
        return true 

    return false
}

//// Main ////

type Callable<F extends Func> = Trait & F & {

    readonly [$$context]: unknown

    get [$$signature](): F

    get name(): string

}

interface CallableStaticProperties {

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

type CallableConstructor = abstract new <F extends Func>() => Callable<F>

//// Callable ////

const Callable = class extends Trait {

    static readonly signature: typeof $$signature = $$signature
    static readonly context: typeof $$context = $$context

    //// Static ////

    static [Trait.onUse](constructor: Func) {
        // Makes instanceof work (more or less) on objects implementing the Callable trait
        define.hidden(
            constructor,
            Symbol.hasInstance,
            isInstanceOfCallable
        )
    }

    static [Trait.onApply]<F extends Func>(instance: Callable<F>): Callable<F> {

        // Create callable instance
        function callable(this: unknown, ...args: unknown[]): unknown {

            // Update outer 'this' context
            assign(callable, { [$$context]: this })

            const signature = (callable as unknown as Callable<Func>)[$$signature]

            return signature.apply(callable, args)
        }

        // Add instance properties
        define.transpose(instance, callable, [Function.prototype])
    
        return callable as unknown as Callable<F>
    }

    static override is = isIntersection(
        isFunc,
        isShape({
            [$$signature]: isFunc
        }),
        isKeyed($$context)
    )

} as CallableConstructor & CallableStaticProperties

//// Export ////

export {
    Callable
}