import { isPrimitive } from '@benzed/util'
import { Schema } from './schema'

import { 
    EnumSchema,
    EnumSchemaInput
} from '../schemas'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Temp ////

type Constructor = new (...args: any) => any | (abstract new (...args: any) => any)

//// Types ////

/**
 * Convenience method 
 */
interface SchemaFrom {
    <T extends Constructor>(c: T): Schema<InstanceType<T>>
    <T extends EnumSchemaInput>(...options: T): EnumSchema<T>
    // tuple shortcut
    // enum shortcut
}

const schemaFrom = ((...args: unknown[]) => {

    if (args.every(isPrimitive))
        return new EnumSchema(...args)

    return (): Schema<any> => {
        throw new Error('not yet implemented')
    }

}) as SchemaFrom

//// Exports ////

export {
    SchemaFrom,
    schemaFrom
}