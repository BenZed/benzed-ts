
import { nil } from './types/nil'
import { intersect } from './types/merge'

//// Type ////

/**
 * Shortcut for Object.defineProperty and Object.defineProperties
 */
interface Property {

    <T extends object>(object: T, property: string | number | symbol, definition: PropertyDescriptor): T
    <T extends object>(object: T, definitions: PropertyDescriptorMap): T

    define<T extends object>(object: T, property: string | number | symbol, definition: PropertyDescriptor): T
    define<T extends object>(object: T, definitions: PropertyDescriptorMap): T

    /**
     * Shortcut for Object.defineProperty(object, 'name', { value })
     */
    name<T>(object: T, name: string): T
    value<T>(object: T, key: string | symbol, value: unknown): T

    descriptorOf(object: object, key: string | symbol): PropertyDescriptor | nil

    descriptorsOf(object: object): PropertyDescriptorMap
    descriptorsOf(...objects: object[]): PropertyDescriptorMap

    symbolsOf(object: object): symbol[]
    symbolsOf(...objects: object[]): symbol[]

    keysOf(object: object): string[]
    keysOf(...objects: object[]): string[]

    prototypesOf(object: object, blacklist?: object[]): object[]
    prototypeOf(object: object): object
}

//// Helper ////

const define = (
    ...args: 
    [
        object: object, 
        property: string | number | symbol, 
        definition: PropertyDescriptor
    ] | [
        object: object, 
        definitions: PropertyDescriptorMap
    ]
): object => {

    const [ object, definitions ] = args.length === 3 
        ? [ args[0], { [ args[1] ]: args[2] } ] 
        : args

    return Object.defineProperties(object, definitions)

}

//// Implementation ////

const property = intersect(
    Object.defineProperty(define, 'name', { writable: true }), // so the name() method can be assigned
    {

        name(object: object, name: string) {
            return property.value(object, 'name', name)
        },

        value(object: object, key: string | symbol, value: unknown) {
            return Object.defineProperty(object, key, { 
                value, 
                enumerable: false, 
                writable: false, 
                configurable: true 
            })
        },

        define,

        descriptorOf(object: object, key: string | symbol) {
            return Object.getOwnPropertyDescriptor(object, key)
        },

        descriptorsOf(...objects: object[]) {
            return intersect(
                ...objects.map(
                    Object.getOwnPropertyDescriptors
                )
            )
        },

        symbolsOf(...objects: object[]) {
            return objects
                .flatMap(Object.getOwnPropertySymbols)
                .filter((x, i, a) => a.indexOf(x) === i) // unique
        },

        keysOf(...objects: object[]) {
            return objects
                .flatMap(Object.getOwnPropertyNames)
                .filter((x,i,a) => a.findIndex(y => Object.is(x, y)) === i) // unique
        },

        prototypes(object: object, blacklist = [Object.prototype]): object[] {
            const prototypes: object[] = []

            let prototype: object | nil = object
            while (prototype) {
                prototype = Object.getPrototypeOf(prototype)
                if (prototype && !blacklist.includes(prototype))
                    prototypes.push(prototype)
            }

            return prototypes.reverse()
        },

        prototypeOf(object: object): object[] {
            return Object.getPrototypeOf(object)
        }
    }

) as Property

//// Exports ////

export default property

export {
    property,
    Property
}