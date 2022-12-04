import { define, keysOf } from '../methods'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Constants ////

/**
 * Keys of properties that exist on a method that may conflict when nesting callable objects
 */
const CONFLICTING_KEYS = ['name', 'prototype', 'length']

//// Symbols ////

const $$signature = Symbol('callable-input-signature-and-conflicts')

//// Types ////

interface CallableSignature<O extends object> {
    (this: O, ...args: any): any
}

type Callable<S extends CallableSignature<O>, O extends object> = 
    // Callable signature without <this>
    ((...args: Parameters<S>) => ReturnType<S>) & O

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

    const signatureDescriptors = define.descriptorsOf(signature)
    const rawSignatureDescriptors = define.descriptorsOf(rawSignature)

    // if we're nesting callable objects, the signature might contain
    // additional properties that don't exist on a function by default,
    // so we filter these out against the method descriptors here.
    for (const key of CONFLICTING_KEYS) {
        if (descriptorsEqual(rawSignatureDescriptors[key], signatureDescriptors[key]))
            delete signatureDescriptors[key]
    }

    const objectDescriptors = define.descriptorsOf(object)

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

    const callable = (...args: Parameters<S>): ReturnType<S> => rawSignature.apply(callable as O, args)

    const callableDescriptors = resolveCallableDescriptors(signature, rawSignature, object)

    return define(
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

    Callable
}