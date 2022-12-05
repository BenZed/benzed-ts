import { define } from '../methods/define'
import { isFunc } from '../types/func'
import createCallableObject, { CallableSignature, Callable } from './object'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

const $$instance = Symbol('callable-class-instance')

//// Types ////

interface Class {
    new (...args: any[]): any
}

type CallableClass<S extends CallableSignature<InstanceType<C>>, C extends Class> = 
    // class constructor signature with the callable instance return type
    (new (...params: ConstructorParameters<C>) => Callable<S, InstanceType<C>>) & C

//// Helpers ////
    
const createCallableInstance = <S extends CallableSignature<InstanceType<C>>, C extends Class>(
    signature: S, 
    constructor: C, 
    instance: InstanceType<C>,
    name: string = signature.name || 

        // PascalCase to camelCase
        constructor.name.charAt(0).toLowerCase() +
        constructor.name.slice(1),
): Callable<S, InstanceType<C>> => {

    // Create callable
    const callable = createCallableObject(
        signature, 
        instance, 
        { 
            name: { 
                value: name,
                configurable: true 
            },
            [$$instance]: {
                value: instance
            },
            ...define.descriptorsOf(constructor.prototype)
        }
    )

    return callable
}

const isClass = (input: unknown): input is Class => 
    isFunc(input) 
    && input.prototype
    && Symbol.hasInstance in input

//// Main ////
    
const createCallableClass = <
    S extends CallableSignature<InstanceType<C>>,
    C extends Class
>(
    signature: S,
    constructor: C,
    name?: string,
): CallableClass<S, C> => {

    if (!isClass(constructor))
        throw new Error('Input must be a class definition')
    
    const Callable = class extends constructor {

        static [Symbol.hasInstance](value: any): boolean {
            return (value?.[$$instance] ?? value) instanceof constructor
        }

        constructor(...args: any[]) {
            
            super(...args)

            return createCallableInstance(
                signature,
                constructor,
                this as InstanceType<C>,
                name,
            )
        }
    }

    return define.name(
        Callable, 
        name ?? `Callable${constructor.name}`
    )
}

//// Exports ////

export default createCallableClass

export {
    createCallableClass,
    CallableClass,

    Class,
    isClass,
    $$instance
}