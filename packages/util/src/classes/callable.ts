
import { each } from '../each'
import { define } from '../methods/define'

import type { Infer } from '../types'
import { Func, isFunc, TypeGuard } from '../types/func'
import { isObject, isShape } from '../types/guards'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

const $$callable = Symbol('callable-data')

//// Helper Types ////

type _RemoveInferredThis<F extends Func> = 
    Infer<(...args: Parameters<F>) => ReturnType<F>>

type _RemoveSignature<T> = T extends Func 
    ? { [K in keyof T]: T[K] }
    : T

//// Type ////

type CallableConstructor = abstract new <F extends Func>(f: F, provider?: CallableContextProvider<F>) => F

type CallableObject<F extends Func, T> = Infer<F & _RemoveSignature<T>>

type CallableData = {
    signature: Func
    template: object
    ctxProvider: CallableContextProvider<Func>
}

//// Helpers ////

const isCallableData: TypeGuard<CallableData> = isShape({
    signature: isFunc,
    template: isObject,
    ctxProvider: isFunc
})

const hasCallableData = <F extends Func>(
    input: F
): input is F & { [$$callable]: CallableData} => 
    $$callable in input && 
    isCallableData(input[$$callable])

interface Callable extends CallableConstructor {

    signatureOf<F extends Func>(callable: F): F
    contextProviderOf<F extends Func>(callable: F): CallableContextProvider<F>
    templateOf<F extends Func>(callable: F): object

    /**
     * Create an object with a call signature.
     * @param signature Method
     * @param template Object to use as a template to add descriptors to.
     */
    create<F extends (this: T, ...args: any) => any, O extends object, T = O> (
        //            ^ infer this context
        signature: F, 
        template: O,
        provider?: CallableContextProvider<F, T>,
    ): CallableObject<_RemoveInferredThis<F>,O>

    create<F extends Func, O extends object>(
        signature: F,
        template: O
    ): CallableObject<F, O>

}

/**
 * For providing a "this" context to callables that 
 * require it.
 */
interface CallableContextProvider<F extends Func, T = ThisType<F>> {
    (context: T, callable: F): unknown
}

//// Default Context Providers ////

const provideDynamicContext: CallableContextProvider<Func> = 
    (ctx, callable) => ctx ?? callable

const provideCallableContext: CallableContextProvider<Func> = 
    (_, callable) => callable

const provideTupleContext = (ctx: unknown, callable: Func): unknown => 
    [ctx, callable]

//// Main ////

/**
 * An extendable class with a call signature
 */
const Callable = class {

    private static _callableDataOf(callable: Func): CallableData {
        if (!hasCallableData(callable))
            throw new Error(`${callable} does not have callable data.`)

        return callable[$$callable]
    }

    static signatureOf(callable: Func): Func {
        const { signature } = this._callableDataOf(callable)
        return signature
    }

    static contextProviderOf(callable: Func): CallableContextProvider<Func> {
        const { ctxProvider } = this._callableDataOf(callable)
        return ctxProvider
    }

    static templateOf(callable: Func): object {
        const { template } = this._callableDataOf(callable)
        return template
    }

    static create(
        signature: Func, 
        template: object, 
        ctxProvider: CallableContextProvider<Func> = provideDynamicContext
    ): object {

        if (!isFunc(signature))
            throw new Error('Signature must be a function.')

        const signatureProperties = signature
        while (hasCallableData(signature)) 
            signature = signature[$$callable].signature

        const isContextual = 'prototype' in signature

        const callable = isContextual
            ? function (this: unknown, ...args: unknown[]): unknown {
                const ctx = ctxProvider(this as ThisType<Func>, callable)
                return signature.apply(ctx, args)
            }
            : (...args: unknown[]) => signature(...args)

        define.transpose(signatureProperties, callable, [Function.prototype])
        define.transpose(template, callable, [Function.prototype])
        define(callable, $$callable, {
            value: {
                signature,
                template,
                ctxProvider
            } satisfies CallableData,
            configurable: true
        })

        return callable
    } 

    static [Symbol.hasInstance](instance: unknown): boolean {

        if (!isObject(instance) || !isFunc(instance?.constructor))
            return false 

        if (Object.is(instance.constructor, this))
            return true

        if (each.prototypeOf(instance.constructor).toArray().includes(this))
            return true 

        return false
    }

    constructor(func: Func, contextProvider = provideCallableContext) {
        return Callable.create(func, this, contextProvider)
    }

} as Callable

//// Exports ////

export default Callable

export {
    Callable,
    CallableObject,
    CallableContextProvider,

    provideCallableContext,
    provideDynamicContext,
    provideTupleContext
}