
import { nil } from '../types'
import { intersect } from '../types/merge'

//// Type ////

/**
 * Shortcut for Object.defineProperty and Object.defineProperties
 */
interface Define {

    <T extends object>(object: T, property: string | number | symbol, definition: PropertyDescriptor): T
    <T extends object>(object: T, definitions: PropertyDescriptorMap): T

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
}

//// Implementation ////

const define = intersect(

    Object.defineProperty((
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

    }, 'name', { writable: true }), // so it can be over written with the name method

    {

        name(object: object, name: string) {
            return define.value(object, 'name', name)
        },

        value(object: object, key: string | symbol, value: unknown) {
            return Object.defineProperty(object, key, { 
                value, 
                enumerable: false, 
                writable: false, 
                configurable: true 
            })
        },

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
        }

    }

) as Define

//// Exports ////

export default define

export {
    define
}