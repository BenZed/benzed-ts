import { describe } from '@jest/globals'
import { assign, define, isInteger, isNumber, nil, pick } from '@benzed/util'
import { Trait } from '@benzed/traits'

import { Not, Optional } from './modifiers'
import { ContractValidator, TypeValidator } from '../validators'

import { testValidator } from '../../util.test'

import Schema from '../schema/schema'
import { Validator } from '../validator'

//// Setup //// 

class IntegerValidator extends TypeValidator<number> { 

    isValid(value: unknown): value is number {
        return isInteger(value)
    }

    cast(input: unknown): unknown { 
        return isNumber(input) ? Math.floor(input) : input
    }

}

class PositiveValidator extends ContractValidator<number, number> {

    readonly enabled: boolean = false 

    transform(input: number): number {
        return Math.max(input, 0)
    } 

    get [Validator.state](): Pick<this, 'name' | 'enabled' | 'message'> {
        return pick(this, 'name', 'enabled', 'message')
    }

    set [Validator.state](state: Pick<this, 'name' | 'enabled' | 'message'>) {
        define.named(state.name, this)
        define.enumerable(this, 'enabled', state.enabled)
        define.enumerable(this, 'message', state.message)
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

    testValidator(
        $integer,
        { transforms: 0 },
        { asserts: 0.5, error: 'must be Integer'},
    )

})

describe(`positive ${$integer.name} validator tests`, () => { 

    testValidator(
        $integer,
        { transforms: 0.5, output: 0 },
        { asserts: 0.5, error: 'must be Integer'},
        { asserts: 1.25, error: 'must be Integer'},
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
        { asserts: -1, error: 'must be Positive' },
        { transforms: -1, output: 0 },
        { asserts: nil },
        { asserts: 1 },
    )

    const $optionalNotInteger = new Optional(new Not($integer))

    testValidator<unknown, unknown> (
        $optionalNotInteger,
        { asserts: nil },
        { asserts: 'string' },
        { asserts: 1, error: true },
        { asserts: 2.5 },
    )

    const $optionalNotPositiveInteger = $optionalNotInteger.positive()

    testValidator<unknown, unknown> (
        $optionalNotPositiveInteger,
        { asserts: 1, error: true },
        { asserts: 'string' },
        { asserts: nil },
        { asserts: 2.5 },
        { asserts: -1 }
    )
})

