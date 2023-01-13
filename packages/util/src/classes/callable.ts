
import { Property } from '../property'
import { Func, Infer, isFunc, isObject, } from '../types'
import PrivateState from './private-state'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _RemoveInferredThis<F extends Func> = 
    Infer<(...args: Parameters<F>) => ReturnType<F>>

type _RemoveSignature<T> = T extends Func 
    ? { [K in keyof T]: T[K] }
    : T

type _SignatureTemplate = { template: object, signature: Func }

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
        const { signature } = PrivateState.for(Callable).get(callable) as _SignatureTemplate
        return signature
    }

    static templateOf(callable: Func): object {

        const { template } = PrivateState.for(Callable).get(callable) as _SignatureTemplate
        return template
    }

    static create(signature: Func, template: object): object {

        if (!isFunc(signature))
            throw new Error('Signature must be a function.')

        const callable = 'prototype' in signature 
            ? function (
                this: unknown, 
                ...args: unknown[]
            ): unknown {
                return signature.apply(this ?? callable, args)
            }
            : (...args: unknown[]) => (signature as Func)(...args)

        Property.transpose(signature, callable, [Object.prototype, Function.prototype])
        Property.transpose(template, callable, [Object.prototype, Function.prototype])
        PrivateState.for(Callable).set(callable, { signature, template })

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