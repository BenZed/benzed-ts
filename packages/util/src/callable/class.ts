import { property } from '../property'
import { isFunc } from '../types/func'
import createCallableObject, { CallableSignature, Callable } from './object'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/restrict-plus-operands
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
    instance: InstanceType<C>,
    name: string = signature.name || 
        // PascalCase to camelCase
        instance.constructor.name.charAt(0).toLowerCase() +
        instance.constructor.name.slice(1),
): Callable<S, InstanceType<C>> => {

    // Crawl prototype chain
    let descriptors: PropertyDescriptorMap = {}
    let prototype = instance
    while ((prototype = Object.getPrototypeOf(prototype)) !== Object.prototype) {
        descriptors = {
            ...descriptors,
            ...property.descriptorsOf(prototype)
        }
    }

    // Create callable
    {
        return createCallableObject(
            signature, 
            instance, 
            { 
                name: { 
                    value: name,
                    configurable: true 
                },

                ...descriptors,

                constructor: {
                    value: instance.constructor,
                    writable: true,
                    enumerable: false,
                    configurable: true,
                },

                [$$instance]: { value: instance, enumerable: false }
            }
        )
    }

}

const isClass = (input: unknown): input is Class => 
    isFunc(input) 
    && input.prototype
    && Symbol.hasInstance in input

//// Main ////

/**
 * This syntax works in testing, but breaks after being transpiled in other packages.
 * Unsure why.
 */

function createCallableClass <
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
            return super[Symbol.hasInstance](value?.[$$instance] ?? value)
        }

        constructor(...args: any[]) {
            super(...args)
            return createCallableInstance(
                signature,
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

export default createCallableClass

export {
    createCallableClass,
    CallableClass,

    Class,
    isClass,
    $$instance
}