
import property from '../property'
import { Func, Infer, isFunc, merge, omit } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _RemoveInferredThis<F extends Func> = 
    Infer<(...args: Parameters<F>) => ReturnType<F>>

type _RemoveSignature<T> = T extends Func 
    ? { [K in keyof T]: T[K] }
    : T
    
//// Type ////

type CallableConstructor = abstract new <F extends Func>(f: F) => F

type CallableObject<F extends Func, T> = Infer<F & _RemoveSignature<T>>

interface Callable extends CallableConstructor {

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

    private static _allDescriptors(object: object): PropertyDescriptorMap {
        return property.descriptorsOf(
            object,
            ...property.prototypesOf(object, [Object.prototype, Function.prototype])
        )
    }

    static create(signature: Func, template: object): object {

        const callable = function (
            this: unknown, 
            ...args: unknown[]
        ): unknown {
            return signature.apply(this ?? callable, args)
        }

        const signatureDescriptors = this._allDescriptors(signature)
        const templateDescriptors = this._allDescriptors(template)

        const callableDescriptors = omit(
            merge(
                signatureDescriptors,
                templateDescriptors
            ), 
            'prototype'
        )

        return property.define(callable, callableDescriptors)
    }

    static [Symbol.hasInstance](instance: unknown): boolean {

        if (!isFunc(instance) || !isFunc(instance?.constructor))
            return false 

        if (Object.is(instance.constructor, this))
            return true

        if (property.prototypesOf(instance.constructor).includes(this))
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