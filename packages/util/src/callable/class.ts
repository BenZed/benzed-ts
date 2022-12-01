import { define } from '../methods'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

const $$instance = Symbol('constructor-instance')

//// Types ////

interface Class {
    new (...args: any[]): any
}

interface CallableSignature<C extends Class> {
    (this: InstanceType<C>, ...args: any[]): any
}

type CallableInstance<C extends Class, S extends CallableSignature<C>> = 
    // callable signature without the 'this' context
    ((...params: Parameters<S>) => ReturnType<S>) & InstanceType<C>

type CallableClass<C extends Class, S extends CallableSignature<C>> = 
    // class constructor signature with the callable instance return type
    (new (...params: ConstructorParameters<C>) => CallableInstance<C, S>) & C

const createCallableInstance = <C extends Class, S extends CallableSignature<C>>(
    signature: S, 
    constructor: C, 
    instance: InstanceType<C>
): CallableInstance<C,S> => {
   
    const hasThisContext = 'prototype' in signature 
    const callableSignature = define.name(
        hasThisContext

            // Keep function this context in sync with the state of the instance
            ? (...params: Parameters<S>) => signature.apply(callableInstance, params)
       
            // the .bind call is not necessary for the 'this' context, but it
            // prevents the property assignment from mutating the original input
            : signature.bind(instance),

        signature.name
    ) as S

    const callableInstance = define(
        callableSignature, 
        {
            ...define.descriptorsOf(
                constructor.prototype, 
                instance
            ),
            [$$instance]: {
                value: instance
            }
        }
    ) as CallableInstance<C,S>

    return callableInstance
}

//// Main ////
    
const createCallableClass = <
    S extends CallableSignature<C>,
    C extends Class
>(
    signature: S,
    constructor: C,
    name?: string
): CallableClass<C,S> => {
    
    const callable = class extends constructor {

        static [Symbol.hasInstance](value: any): boolean {
            return (value?.[$$instance] ?? value) instanceof constructor
        }

        constructor(...args: any[]) {
            
            super(...args)

            return createCallableInstance(
                signature,
                constructor,
                this as InstanceType<C>
            )
        }
    }

    return define.name(
        callable, 
        name ?? `Callable${constructor.name}`
    )
}

export {
    createCallableClass,
    CallableClass,
    CallableInstance,
    CallableSignature
}