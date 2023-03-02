import { InstanceValidator } from './instance-validator'

import { describe } from '@jest/globals'
import { isNumber, isString } from '@benzed/util'

import { testValidator } from '../../../util.test'
 
//// Setup ////

class DateValidator extends InstanceValidator<typeof Date> {

    constructor() {
        super(Date)
    }

    cast(input: unknown): unknown {
        if (isString(input) && /\d+/.test(input) || isNumber(input)) 
            return new Date(input)

        return input
    }
}

const $date = new DateValidator()

//// Tests ////

describe(`${$date.name} validator tests`, () => { 

    testValidator<unknown, Date>(
        $date, 
        { asserts: new Date() },
        { transforms: 0, output: new Date(0) },
        { asserts: 'no-bueno', error: true }
    )
})