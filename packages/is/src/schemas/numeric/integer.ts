import { TypeSchema } from '@benzed/schema'

import { isInteger, isString } from '@benzed/util'
import NumericValidator from './numeric'

//// Boolean ////

class IntegerValidator extends NumericValidator<number> {

    override isValid(input: unknown): input is number {
        return isInteger(input)
    }

    override cast(i: unknown) {
        return isString(i) ? parseInt(i) : i 
    }

}

//// Exports ////

export class Integer extends TypeSchema<IntegerValidator, {}> {
    constructor() {
        super(new IntegerValidator, {})
    }
}

export const $integer = new Integer
