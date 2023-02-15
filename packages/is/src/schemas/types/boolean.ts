
import { 
    isBoolean, 
    isNil 
} from '@benzed/util'

import {
    TypeValidator,
} from '../../validators/type-validator'

import { TypeSchema } from '../type'

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

class BooleanValidator extends TypeValidator<boolean> {

    isValid(value: unknown): value is boolean {
        return isBoolean(value)
    }

    override cast = toBoolean

}

//// Schema ////

class Boolean extends TypeSchema<TypeValidator<boolean>, {}> {

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

export const $boolean = new Boolean
