/* eslint-disable
    @typescript-eslint/no-explicit-any  
*/

import { isBigInt, isBoolean, isFunction, isNumber, isObject, isString, isSymbol } from './is-basic'
import type { Constructor } from './types'

/*** Types ***/

type TypeTest<T> = (input: unknown) => input is T

type Typeable<T> = Constructor<T> | { prototype: T }

type IsOfTypeable<T> = T extends Constructor<T>
    ? InstanceType<T>
    : T extends { prototype: infer U } ? U : never

/*** Data ***/

const typeTests: Map<Typeable<unknown>, TypeTest<unknown>> = new Map()
typeTests.set(String, isString)
typeTests.set(Number, isNumber)
typeTests.set(Boolean, isBoolean)
typeTests.set(Symbol, isSymbol)
typeTests.set(Function, isFunction)
typeTests.set(Object, isObject)
typeTests.set(BigInt, isBigInt)

/**
 * True if a given value is an instance (or type) of one of
 * the given types.
 * @param input value
 * @param types types to check against
 * @returns true or false
 */
function isInstanceOf<T extends (Typeable<any>)[]>(
    input: unknown,
    ...types: T
): input is IsOfTypeable<typeof types[number]> {

    let foundTypeTest = false
    for (const type of types) {
        const typeTest = typeTests.get(type)
        if (typeTest)
            foundTypeTest = true

        if (typeTest?.(input))
            return true
    }

    if (!foundTypeTest) {
        for (const type of types) {
            if (input instanceof (type as Constructor<T>))
                return true
        }
    }

    return false
}

/*** Exports ***/

export default isInstanceOf

export { isInstanceOf }