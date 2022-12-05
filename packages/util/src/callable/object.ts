import { keysOf } from '../methods'
import { property } from '../property'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Constants ////

/**
 * Keys of properties that exist on a method that may conflict when nesting callable objects
 */
const CONFLICTING_KEYS = ['name', 'prototype', 'length']

//// Symbols ////

const $$signature = Symbol('callable-signature')
const $$context = Symbol('callable-outer-this-context')

//// Types ////

interface CallableSignature<O extends object> {
    (this: O, ...args: any): any
}

type Callable<S extends CallableSignature<O>, O extends object> = 
    ((...args: Parameters<S>) => ReturnType<S>) & O

//// Context helpers ////

const getContext = (callable: Callable<CallableSignature<object>, object>): unknown => 
    (callable as unknown as { [$$context]: unknown })[$$context] 

const bindContext = (callable: Callable<CallableSignature<object>, object>, ctx: unknown): unknown => 
    property(callable, $$context, { value: ctx, writable: false, configurable: true, enumerable: false })

const setContext = (callable: Callable<CallableSignature<object>, object>, ctx: unknown): unknown => {
    return transferContext({ [$$context]: ctx } as unknown as Callable<CallableSignature<object>, object>, callable)
}

const transferContext = (
    from: Callable<CallableSignature<object>, object>, 
    to: Callable<CallableSignature<object>, object>
): typeof to => {
    
    const transferContext = property.descriptorsOf(from)[$$context]
    const targetContext = property.descriptorsOf(to)[$$context]

    if (transferContext && (!targetContext || targetContext.writable)) {
        property(to, $$context, { 
            value: transferContext.value,
            writable: transferContext.writable, 
            configurable: true, 
            enumerable: false 
        })
    }

    return to
}

//// Helper ////

const hasRawSignature = <S extends CallableSignature<O>, O extends object>(
    input: object
): input is { [$$signature]: S } =>
    $$signature in input

const descriptorsEqual = (a: PropertyDescriptor, b: PropertyDescriptor): boolean => {
    for (const key of keysOf(a)) {
        if (a[key] !== b?.[key])
            return false
    } 

    return true
}

const resolveCallableDescriptors = <S extends CallableSignature<O>, O extends object>(
    signature:S ,
    rawSignature: S,
    object: O

): PropertyDescriptorMap => {

    const signatureDescriptors = property.descriptorsOf(signature)
    const rawSignatureDescriptors = property.descriptorsOf(rawSignature)

    // if we're nesting callable objects, the signature might contain
    // additional properties that don't exist on a function by default,
    // so we filter these out against the method descriptors here.
    for (const key of CONFLICTING_KEYS) {
        if (descriptorsEqual(rawSignatureDescriptors[key], signatureDescriptors[key]))
            delete signatureDescriptors[key]
    }

    const objectDescriptors = property.descriptorsOf(object)

    return {
        ...signatureDescriptors,
        ...objectDescriptors,
        [$$signature]: { 
            value: rawSignature, 
            writable: false, 
            enumerable: false,  
            configurable: false 
        }
    }
}

/**
 * Given 
 * @param signature 
 * @returns 
 */
const resolveRawSignature = <S extends CallableSignature<O>, O extends object>(signature: S): S => 
    hasRawSignature<S,O>(signature)
        ? signature[$$signature]
        : signature

//// Main ////

const createCallableObject = <S extends CallableSignature<O>, O extends object>(
    signature: S, 
    object: O,
    injectDescriptors?: PropertyDescriptorMap
): Callable<S,O> => {

    // resolve signature
    const rawSignature = resolveRawSignature<S,O>(signature)

    const callable = function (this: unknown, ...args: Parameters<S>): ReturnType<S> {
        setContext(callable, this)
        return rawSignature.apply(callable as O, args)
    }

    const callableDescriptors = resolveCallableDescriptors(signature, rawSignature, object)

    return property(
        callable,
        {
            ...injectDescriptors,
            ...callableDescriptors
        }
    ) as Callable<S,O>
}

//// Exports ////

export default createCallableObject

export {
    createCallableObject,
    CallableSignature,

    Callable,

    $$signature,

    getContext,
    setContext,
    bindContext,
    transferContext
}