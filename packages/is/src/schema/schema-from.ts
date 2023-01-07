import { isFunc, isPrimitive } from '@benzed/util'

import { Schema } from './schema'

import { 
    IsEnum,
    IsEnumInput,
    IsInstance,
    IsInstanceInput
} from './schemas'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

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

    const isSingle = args.length === 1

    if (args.every(isPrimitive))
        return new IsEnum(...args)

    if (args.every(arg => arg instanceof Schema))
        return isSingle ? args[0] : new IsTuple(...args)

    if (isSingle && isFunc(args[0]))
        return new IsInstance(args[0] as unknown as IsInstanceInput)

    throw new Error('Invalid Signature')

}) as SchemaFrom

//// Exports ////

export {
    SchemaFrom,
    schemaFrom
}