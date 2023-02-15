import { describe } from '@jest/globals'
import { isInteger, isNumber, nil, pick } from '@benzed/util'

import { Not, Optional } from './mutators'
import ContractValidator from '../contract-validator'
import { Schema, TypeValidator } from '../validators'

import {
    testValidator,
    testValidationContract
} from '../../util.test'

import { $$settings } from '../validate-struct'

//// Setup ////

class IntegerValidator extends TypeValidator<number> {

    override name = 'Integer'

    isValid(value: unknown): value is number {
        return isInteger(value)
    }

    cast(input: unknown): unknown {
        return isNumber(input) ? Math.floor(input) : input
    }

    message(): string {
        return 'Must be an integer'
    }
}

class PositiveValidator extends ContractValidator<number, number> {

    readonly enabled: boolean = false 

    transform(input: number): number {
        return Math.max(input, 0)
    } 

    message(): string {
        return 'Must be positive'
    }

    get [$$settings](): Pick<this, 'enabled'> {
        return pick(this, 'enabled')
    }
}

class Integer extends Schema<IntegerValidator, { positive: PositiveValidator }> {

    constructor() {
        super(
            new IntegerValidator(), 
            {
                positive: new PositiveValidator() 
            }
        )
    }

    positive(enabled = true): this {
        return this._applySubValidator('positive', { enabled })
    }

}

const $integer = new Integer()

//// Tests ////

describe(`${$integer.name} validator tests`, () => {

    testValidationContract<unknown, number>(
        $integer,
        {
            validInput: 0,  
            invalidInput: 'oy',
        }
    )

    testValidator(
        $integer,
        { transforms: 0 },
        { asserts: 0.5, error: 'Must be an integer'},
    )

})

describe(`positive ${$integer.name} validator tests`, () => { 

    testValidationContract<unknown, number>(
        $integer.positive(),
        {
            validInput: 0,
            invalidInput: 'string',
            transforms: { invalidInput: 0.5, validOutput: 0 }
        }
    )

    testValidator(
        $integer,
        { transforms: 0.5, output: 0 },
        { asserts: 0.5, error: 'Must be an integer'},
        { asserts: 1.25, error: 'Must be an integer'},
    )

})

describe('stacking', () => {

    const $optionalInteger = new Optional($integer)

    const $optionalPositiveInteger = $optionalInteger.positive()

    testValidator<unknown, number | nil> (
        $optionalInteger,
        { transforms: nil },
        { asserts: nil },
    )

    testValidator<unknown, number | nil> (
        $optionalPositiveInteger,
        { transforms: nil },
        { asserts: -1, error: 'Must be positive' },
        { transforms: -1, output: 0 },
        { asserts: nil },
        { asserts: 1 },
    )

    const $optionalNotInteger = new Optional(new Not($integer))

    testValidator<unknown, unknown> (
        $optionalNotInteger,
        { asserts: nil },
        { asserts: 'string' },
        { asserts: 1, error: 'Must not be Integer' },
        { asserts: 2.5 },
    )

    const $optionalNotPositiveInteger = $optionalNotInteger.positive()

    testValidator<unknown, unknown> (
        $optionalNotPositiveInteger,
        { asserts: 1, error: 'Must not be Integer' },
        { asserts: 'string' },
        { asserts: nil },
        { asserts: 2.5 },
        { asserts: -1 }
    )
})

