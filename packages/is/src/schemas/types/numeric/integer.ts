import { Schema, TypeValidator } from '@benzed/schema'

import { assign, isInteger, isString, Mutable } from '@benzed/util'
import { Number } from './number'

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

export class Integer extends Number {

    constructor() {
        super();
        (this as Mutable<this>)[Schema.main] = new IntegerValidator()
    }

}

export const $integer = new Integer
