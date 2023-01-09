
import { Property } from '../property'
import { Func, Infer, isFunc, isObject, } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbol ////

const $$retreiveSignature = Symbol('retreive-signature-from-callable-param')

//// Helper Types ////

type _RemoveInferredThis<F extends Func> = 
    Infer<(...args: Parameters<F>) => ReturnType<F>>

type _RemoveSignature<T> = T extends Func 
    ? { [K in keyof T]: T[K] }
    : T
    
//// Type ////

type CallableConstructor = abstract new <F extends Func>(f: F, memoize?: boolean) => F

type CallableObject<F extends Func, T> = Infer<F & _RemoveSignature<T>>

interface Callable extends CallableConstructor {

    signatureOf<F extends Func>(callable: F): F

    templateOf<F extends Func>(callable: F): object

    /**
     * Create an object with a call signature.
     * @param signature Method
     * @param template Object to use as a template to add descriptors to.
     */
    create<F extends (this: T, ...args: any) => any, O extends object, T = O>(
        //            ^ infer this context
        signature: F, 
        template: O
    ): CallableObject<_RemoveInferredThis<F>,O>

    create<F extends Func, O extends object>(
        signature: F,
        template: O
    ): CallableObject<F, O>

}

//// Main ////

/**
 * An extendable class with a call signature
 */
const Callable = class {

    static signatureOf(callable: Func): Func {

        const result = callable($$retreiveSignature)
        const signature = result?.signature
        
        if (!isFunc(signature))
            throw new Error('Input method is not a callable object.')

        return signature
    }

    static templateOf(callable: Func): object {

        const result = callable($$retreiveSignature)
        const template = result?.template
        
        if (!isObject(template))
            throw new Error('Input method is not a callable object.')

        return template
    }

    static create(signature: Func, template: object): object {

        const callable = function (
            this: unknown, 
            ...args: unknown[]
        ): unknown {
            return args[0] === $$retreiveSignature 
                ? { signature, template }
                : signature.apply(this ?? callable, args)
        }

        Property.transpose(signature, callable, [Object.prototype, Function.prototype])
        Property.transpose(template, callable, [Object.prototype, Function.prototype])

        return callable
    }

    static [Symbol.hasInstance](instance: unknown): boolean {

        if (!(isFunc(instance) || isObject(instance)) || !isFunc(instance?.constructor))
            return false 

        if (Object.is(instance.constructor, this))
            return true

        if (Property.prototypesOf(instance.constructor).includes(this))
            return true 

        return false
    }

    constructor(func: Func) {
        return Callable.create(func, this)
    }

} as Callable

//// Exports ////

export default Callable

export {
    Callable,
    CallableObject
}