import { isPrimitive } from '@benzed/util'
import { Schema } from './schema'

import { 
    IsEnum,
    IsEnumInput
} from './schemas'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Temp ////

//// Types ////

// TODO Make me
export type IsInstanceInput = new (...args: any) => any | (abstract new (...args: any) => any)
export type IsInstance<C extends IsInstanceInput> = Schema<InstanceType<C>>

/**
 * Convenience method 
 */
interface SchemaFrom {
    <T extends IsInstanceInput>(type: T): IsInstance<T>
    <T extends IsEnumInput>(...options: T): IsEnum<T>
    <T extends Schema>(schema: T): T
    // tuple shortcut
    // shape shortcut
}

const schemaFrom = ((...args: unknown[]) => {

    if (args.every(isPrimitive))
        return new IsEnum(...args)

    if (args.length === 1 && args[0] instanceof Schema)
        return args[0]

    return (): Schema<any> => {
        throw new Error('not yet implemented')
    }

}) as SchemaFrom

//// Exports ////

export {
    SchemaFrom,
    schemaFrom
}