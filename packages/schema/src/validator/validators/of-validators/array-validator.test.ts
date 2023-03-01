import { describe } from '@jest/globals'

import { Trait } from '@benzed/traits'
import { assign, define, isNumber, isString, nil, pick, through } from '@benzed/util'

import Schema from '../../schema/schema'
import { testValidator } from '../../../util.test'
import { ValidateStructural } from '../../../traits'
import { ValidationErrorMessage } from '../../../validation-error'

import { ArrayValidator } from './array-validator'
import { TypeValidator } from '../contract-validators'
import { copy } from '@benzed/immutable'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/ban-types,
*/

//// Setup ////
class NumberValidator extends Trait.add(TypeValidator<number>, ValidateStructural) {

    isValid(value: unknown): value is number {
        return isNumber(value) && (!this.positive || value >= 0) 
    }

    cast(input: unknown): unknown {
        return isString(input) ? parseFloat(input) : input
    }

    readonly name: string = 'Number'

    readonly positive: boolean = false

    readonly message: ValidationErrorMessage<unknown, number> = 
        function (): string {
            return [
                'Must be a',
                this.positive ? 'positive' : '',
                this.name
            ].filter(through).join(' ')
        }

    //// State ////
    
    get [ValidateStructural.state](): Pick<this, 'name' | 'positive' | 'message'> {
        return pick(this, 'name', 'positive', 'message')
    }

    set [ValidateStructural.state]({ name, positive, message }: Pick<this, 'name' | 'positive' | 'message'>) {
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

    message(message: ValidationErrorMessage<unknown>): this {
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