
import { intersect } from '../types'

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
    descriptorsOf(object:object): PropertyDescriptorMap
    symbolsOf(object: object): symbol[]
    namesOf(object: object): string[]
}

//// Implementation ////

const define = intersect(

    Object.defineProperty((
        ...args: 
        [object: object, property: string | number | symbol, definition: PropertyDescriptor] | 
        [object: object, definitions: PropertyDescriptorMap]
    ): object => {

        const [object, definitions] = args.length === 3 
            ? [args[0], { [args[1]]: args[2] }] 
            : args
    
        return Object.defineProperties(object, definitions)
    }, 'name', { writable: true }),

    {
        name(object: object, name: string) {
            return Object.defineProperty(object, 'name', { value: name })
        },

        descriptorsOf(object: object) {
            return Object.getOwnPropertyDescriptors(object)
        },

        symbolsOf(object: object) {
            return Object.getOwnPropertySymbols(object)
        },

        namesOf(object: object) {
            return Object.getOwnPropertyNames(object)
        }
    }

) as Define

//// Exports ////

export default define

export {
    define
}