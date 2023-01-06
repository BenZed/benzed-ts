import { isBoolean, isNil } from '@benzed/util'
import { TypeSchema } from './type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

const toBoolean = (input: unknown): unknown => input === 'false' || input === 0 || isNil(input) 
    ? false
    : input === 'true' || input === 1 
        ? true 
        : input

//// Types ////

interface BooleanSchema extends TypeSchema<boolean> {}

//// Boolean ////

class BooleanSchema extends TypeSchema<boolean> {
    constructor() {
        super({
            type: 'boolean',
            is: isBoolean,
            cast: toBoolean
        })
    }
}

//// Exports ////

export default BooleanSchema

export {
    BooleanSchema
}