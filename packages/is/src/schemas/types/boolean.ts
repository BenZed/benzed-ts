import { Schema } from '@benzed/schema/src'
import { isBoolean as isBoolean, isNil } from '@benzed/util'
import { ConfigurableTypeValidator } from '../../validators/configurable-type-validator'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Helper ////

const toBoolean = (
    input: unknown
): unknown => 
    input === 'false' || input === 0 || input === BigInt(0) || isNil(input) 
        ? false
        : input === 'true' || input === 1 || input === BigInt(1)
            ? true
            : input

//// Validator ////

class BooleanValidator extends ConfigurableTypeValidator<boolean> {

    isValid(value: unknown): value is boolean {
        return isBoolean(value)
    }

    override cast = toBoolean

}

//// Schema ////

class Boolean extends Schema<ConfigurableTypeValidator<boolean>, {}> {

    constructor() {
        super(
            new BooleanValidator(), 
            {}
        )
    }

}

//// Exports ////

export default Boolean

export {
    Boolean
}

export const $boolean = new Boolean()
