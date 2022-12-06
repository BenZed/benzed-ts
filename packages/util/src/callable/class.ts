import { property } from '../property'
import { isFunc } from '../types/func'
import createCallableObject, { BoundSignature, Callable, GetSignature } from './object'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/restrict-plus-operands
*/

//// Types ////

interface Class {
    new (...args: any[]): any
}

type CallableClass<S extends BoundSignature<InstanceType<C>>, C extends Class> = 
    // class constructor signature with the callable instance return type
    (new (...params: ConstructorParameters<C>) => Callable<S, InstanceType<C>>) & C

//// Helpers ////
    
const createCallableInstance = <S extends BoundSignature<InstanceType<C>>, C extends Class>(
    signature: S, 
    instance: InstanceType<C>,
    name: string = signature.name || 
        // PascalCase to camelCase
        instance.constructor.name.charAt(0).toLowerCase() +
        instance.constructor.name.slice(1),
): Callable<S, InstanceType<C>> => {

    const callable = createCallableObject(
        signature, 
        instance
    )

    // Create callable
    return property(
        callable, 
        { 

            name: { 
                value: name,
                configurable: true 
            },

            constructor: {
                value: instance.constructor,
                writable: true,
                enumerable: false,
                configurable: true,
            }
        }
    )
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
    S extends BoundSignature<InstanceType<C>>,
    C extends Class
>(
    signature: S,
    Class: C,
    name?: string,
): CallableClass<GetSignature<S, InstanceType<C>>, C> {

    if (!isClass(Class))
        throw new Error('Input must be a class definition')

    class Callable extends Class {

        static [Symbol.hasInstance](value: object): boolean {
            return !!value?.constructor && property.prototypes(value.constructor).includes(Class)
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
    ) as any
}

//// Exports ////

export default createCallableClass

export {
    createCallableClass,
    CallableClass,

    Class,
    isClass
}