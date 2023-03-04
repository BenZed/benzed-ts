import { TypeValidator } from '@benzed/schema'

import { isInteger, isString } from '@benzed/util'
import { Numeric } from './numeric'

//// Boolean ////

class IntegerValidator extends TypeValidator<number> {

    override isValid(input: unknown): input is number {
        return isInteger(input)
    }

    override cast(i: unknown) {
        return isString(i) ? parseInt(i) : i 
    }

}

//// Exports ////

export class Integer extends Numeric<number, {}> {
    constructor() {
        super(new IntegerValidator, {})
    }
}

export const $integer = new Integer
