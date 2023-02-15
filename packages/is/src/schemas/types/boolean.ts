import { 
    SchemaBuilder 
} from '@benzed/schema'

import { 
    isBoolean, 
    isNil 
} from '@benzed/util'

import {
    TypeValidator,
    TypeCast, 
    TypeDefault 
} from '../../validators/type-validator'

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

interface Boolean extends SchemaBuilder<TypeValidator<boolean>, {}> {

    cast: (caster: TypeCast) => this 

    default: (def: TypeDefault) => this

}
const Boolean = class Boolean extends SchemaBuilder<TypeValidator<boolean>, {}> {

    constructor() {
        super(
            new BooleanValidator(), 
            {}
        )
    }

} as new () => Boolean

//// Exports ////

export default Boolean

export {
    Boolean
}

export const $boolean = new Boolean
