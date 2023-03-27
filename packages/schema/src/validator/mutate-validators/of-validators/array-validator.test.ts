import { describe } from '@jest/globals'

import { assign, define, isNumber, isString, nil, pick, through } from '@benzed/util'

import Schema from '../../schema/schema'
import { testValidator } from '../../../util.test'
import { ValidationErrorMessage } from '../../../validation-error'

import { ArrayValidator } from './array-validator'
import { TypeValidator } from '../../validators'
import { Validator } from '../../validator'
import ValidationContext from '../../../validation-context'

//// EsLint ////
/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Setup ////
class NumberValidator extends TypeValidator<number> {

    isValid(value: unknown): value is number {
        return isNumber(value) && (!this.positive || value >= 0) 
    }

    override cast(input: unknown): unknown {
        return isString(input) ? parseFloat(input) : input
    }

    readonly positive: boolean = false

    override message(input: unknown, ctx: ValidationContext<unknown, number>): string {
        void input
        void ctx
        return [
            'Must be a',
            this.positive ? 'positive' : '',
            this.name
        ].filter(through).join(' ')
    }

    //// State ////
    
    get [Validator.state](): Pick<this, 'name' | 'positive' | 'message' | 'cast' | 'default'> {
        return pick(this, 'name', 'positive', 'message', 'cast', 'default')
    }

    set [Validator.state]({ name, positive, message }: Pick<this, 'name' | 'positive' | 'message'>) {
        assign(this, { positive, message })
        define.named(name, this)
    }

}
class Number extends Schema<NumberValidator, {}> { 

    constructor() {
        super(new NumberValidator, {})
    } 

    named(name: string): this {
        return this._applyMainValidator({ name })
    }

    positive(positive = true): this {
        return this._applyMainValidator({ positive })
    }

    message(error: ValidationErrorMessage<unknown>): this {
        const message = isString(error) ? () => error : error
        return this._applyMainValidator({ message })
    }

}

const $numberSchema = new Number

const $arrayOfNumber = new ArrayValidator($numberSchema)

//// Tests ////

describe(`${$arrayOfNumber.name} validator tests`, () => {
    testValidator<unknown, number[]>(
        $arrayOfNumber,
        { asserts: [] },
        { asserts: [0] },
        { asserts: [0, 1, 2, 3] },
        { asserts: ['atr'], error: 'index 0 Must be a Number' },
        { transforms: ['0'], output: [0] },
        { transforms: ['atr'], error: true },
    )
}) 

describe('retains wrapped validator properties', () => {

    testValidator<unknown, number[]>(
        $arrayOfNumber,
        { asserts: [nil, nil], error: true },
    )

    const $arrayOfDefaultZeros = $arrayOfNumber.positive()

    testValidator<unknown, number[]>(
        $arrayOfDefaultZeros,
        { asserts: [ -1, -1 ], error: true },
        { asserts: [ 0, 0 ] },
    ) 

})

describe('nestable', () => { 

    const $arrayOfArrayOfNumber = new ArrayValidator(new ArrayValidator($numberSchema))

    testValidator<unknown, unknown[][]>(
        $arrayOfArrayOfNumber,
        { asserts: [[0]] },
        { asserts: [0], error: true }
    )

})