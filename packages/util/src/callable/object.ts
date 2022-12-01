import { define } from '../methods'
import { omit } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbols ////

const $$signature = Symbol('callable-input-signature')

//// Types ////

interface CallableSignature<O extends object> {
    (this: O, ...args: any): any
}

type Callable<S extends CallableSignature<O>, O extends object> = 
    ((...args: Parameters<S>) => ReturnType<S>) & O

//// Helper ////

const hasInputSignature = <S extends CallableSignature<O>, O extends object>(
    input: object
): input is { [$$signature]: S } =>
    $$signature in input

//// Main ////

const createCallableObject = <S extends CallableSignature<O>, O extends object>(
    signature: S, 
    object: O
): Callable<S,O> => {

    const inputSignature = hasInputSignature<S,O>(signature)
        ? signature[$$signature]
        : signature

    const hasThisContext = 'prototype' in inputSignature 
    const callableSignature = hasThisContext

        // keep <this> context in sync
        ? (...args: Parameters<S>): ReturnType<S> => inputSignature.apply(callable, args)
        
        // copy to prevent mutation
        : inputSignature.bind(undefined as any)

    const callable = define(
        callableSignature,
        {

            ...define.descriptorsOf(object),

            // in case the input was a callable
            ...omit(define.descriptorsOf(signature), 'length', 'name'),

            [$$signature]: { value: signature } 

        }
    ) as Callable<S,O>

    return callable 
}

//// Exports ////

export default createCallableObject

export {
    createCallableObject
}