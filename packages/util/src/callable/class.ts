import { property } from '../property'
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
    Callable: CallableClass<S,C>,
    signature: S, 
    Class: C, 
    instance: InstanceType<C>,
    name: string = signature.name || 

        // PascalCase to camelCase
        Class.name.charAt(0).toLowerCase() +
        Class.name.slice(1),
): Callable<S, InstanceType<C>> => {

    // Create callable
    return createCallableObject(
        signature, 
        instance, 
        { 
            name: { 
                value: name,
                configurable: true 
            },

            // TODO what might be better is creating getter/setter 
            // properties that affect the actual instance
            ...property.descriptorsOf(Class.prototype),

            [$$instance]: { value: instance },

            constructor: {
                value: Callable,
                enumerable: false,
                writeable: true,
                configurable: true
            } as PropertyDescriptor
        }
    )
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
    const Callable = function(...args: any[]): InstanceType<C> {
        return createCallableInstance(
            Callable,
            signature,
            Class,
            new Class(...args),
            name,
        )
    } as unknown as CallableClass<S,C>
    
    // extend
    Object.setPrototypeOf(Callable, Class)

    // instanceof
    property.value(Callable, Symbol.hasInstance, (value: any) => (value?.[$$instance] ?? value) instanceof Class)

    // name
    return property.name(
        Callable, 
        name ?? `Callable${Class.name}`
    )
}

//// Es6 Extend ////

/**
 * This syntax works in testing, but breaks after being transpiled in other packages.
 * Unsure why.
 */

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
                Callable,
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

//// Exports ////

export default es5CreateCallableClass

export {
    es5CreateCallableClass as createCallableClass,
    es5CreateCallableClass,
    es6CreateCallableClass,
    CallableClass,

    Class,
    isClass,
    $$instance
}