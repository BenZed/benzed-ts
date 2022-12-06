import { property } from '../property'
import { Func, isFunc } from '../types/func'
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
            ...property.descriptorsOf(constructor.prototype)
        }
    )

    return callable
}

const isClass = (input: unknown): input is Class => 
    isFunc(input) 
    && input.prototype
    && Symbol.hasInstance in input

////  ES5 Extend  ////

function es5CreateCallableClass<
    S extends CallableSignature<InstanceType<C>>,
    C extends Class
>(
    signature: S,
    Class: C,
    name?: string,
): CallableClass<S,C> {
    
    if (!isClass(Class))
        throw new Error('Input must be a class definition')

    // declare
    function Callable (...args: any[]): InstanceType<C> {
        return createCallableInstance(
            signature,
            Class,
            new Class(...args),
            name,
        )
    }
    
    // extend
    Object.setPrototypeOf(Callable, Class)

    // instanceof
    property.value(Callable, Symbol.hasInstance, 
        (value: any) => (value?.[$$instance] ?? value) instanceof Class
    )

    // name
    return property.name(
        Callable, 
        name ?? `Callable${Class.name}`
    ) as unknown as CallableClass<S,C>
}

//// Es6 Extend ////

/**
 * This syntax works in testing, but breaks after being transpiled in other packages.
 * Unsure why.
 */

/*
function es6CreateCallableClass <
    S extends CallableSignature<InstanceType<C>>,
    C extends Class
>(
    signature: S,
    Class: C,
    name?: string,
): CallableClass<S, C> {

    if (!isClass(Class))
        throw new Error('Input must be a class definition')

    class Callable extends Class {

        static [Symbol.hasInstance](value: any): boolean {
            return (value?.[$$instance] ?? value) instanceof Class
        }
        constructor(...args: any[]) {
            super(...args)
            return createCallableInstance(
                signature,
                Class,
                this as InstanceType<C>,
                name,
            )
        }
    }

    return property.name(
        Callable, 
        name ?? `Callable${Class.name}`
    )
}
*/ 

//// Exports ////

export default es5CreateCallableClass

export {
    es5CreateCallableClass as createCallableClass,
    CallableClass,

    Class,
    isClass,
    $$instance
}