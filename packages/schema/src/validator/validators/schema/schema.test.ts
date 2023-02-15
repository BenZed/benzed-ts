import { Schema } from './schema'

import { isNumber, isString, through as isNotEmpty, pick, SignatureParser, isBoolean, isOptional } from '@benzed/util'

import TypeValidator from '../type-validator'
import { $$settings } from '../../validate-struct'
import ValidationContext from '../../../validation-context'
import { isValidationErrorMessage, ValidationErrorMessage } from '../../../validation-error'

import { testValidator } from '../../../util.test'

import {SubContractValidator} from './sub-contract-validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Main Validators ////

class NumberValidator extends TypeValidator<number> {

    isValid(value: unknown): value is number {
        return isNumber(value) && (!this.positive || value >= 0)
    }

    readonly name: string = 'Number'

    readonly positive: boolean = false

    message(ctx: ValidationContext<unknown>): string {
        void ctx
        return [
            'Must be a',
            this.positive ? 'positive' : '',
            this.name
        ].filter(isNotEmpty).join(' ')
    }

    //// State ////
    
    get [$$settings](): Pick<this, 'name' | 'positive' | 'message'> {
        return pick(this, 'name', 'positive', 'message')
    }

}

//// Sub Validators ////

abstract class NumberSubContractValidator extends SubContractValidator<number> {

    get [$$settings](): Pick<this, 'enabled' | 'message'> {
        return pick(this, 'enabled', 'message')
    }

}

abstract class LimitValidator<O extends '>' | '<'> extends SubContractValidator<number> {

    abstract get operator(): O

    constructor(
        readonly value: number,
        readonly inclusive: boolean
    ) {
        super()
    }

    isValid(value: number): boolean {
        return this.operator === '>'
            ? this.inclusive 
                ? this.value >= value 
                : this.value > value 
            : this.inclusive 
                ? this.value <= value 
                : this.value < value
    }
    readonly message: string | ValidationErrorMessage<number> =     
        function (ctx: ValidationContext<number>): string {

            void ctx

            const valueDetail = this.operator === '>'
                ? 'less than'
                : 'greater than'

            const inclusiveDetail = this.inclusive 
                ? ' or equal to'
                : ''

            const detail = valueDetail + inclusiveDetail

            return `Must be ${detail} ${this.value}`
        }

    get [$$settings](): Pick<this, 'enabled' | 'message' | 'value' | 'inclusive'> {
        return pick(this, 'enabled', 'message', 'value', 'inclusive')
    }

}

const toLimit = new SignatureParser({
    enabled: isOptional(isBoolean),
    message: isOptional(isValidationErrorMessage),
    inclusive: isOptional(isBoolean),
    value: isNumber,
})
    .setDefaults({
        enabled: true as boolean
    })
    .addLayout('enabled')
    .addLayout('value', 'message')
    .addLayout('value', 'inclusive', 'message')

type ToLimitParams = 
    [enabled: false] | 
    [value: number, message?: string | ValidationErrorMessage<number>] | 
    [value: number, inclusive?: boolean, message?: string | ValidationErrorMessage<number>] | 
    [settings: { value: number, message?: string | ValidationErrorMessage<number>, inclusive?: boolean }]

class MinValidator extends LimitValidator<'<'> {
    get operator(): '<' {
        return '<'
    }
    readonly enabled: boolean = false
}

class MaxValidator extends LimitValidator<'>'> {
    get operator(): '>' {
        return '>'
    }
    readonly enabled: boolean = false 
}

//// Schema ////

class NumberSchema extends Schema<NumberValidator, {
    min: MinValidator
    max: MaxValidator
}> {

    constructor() {
        super(new NumberValidator, {
            min: new MinValidator(-Infinity, true),
            max: new MaxValidator(Infinity, false)
        })
    }

    named(value: string): this {
        return this._applyMainValidator({ name: value })
    }

    positive(value = true): this {
        return this._applyMainValidator({ positive: value })
    }

    message(value: string | ValidationErrorMessage<unknown>): this {
        return this._applyMainValidator({
            message: isString(value) ? () => value : value
        })
    }

    min(...params: ToLimitParams): this {
        const minSettings = toLimit(...params as Parameters<typeof toLimit>)
        return this._applySubValidator('min', minSettings)
    }

    max(...params: ToLimitParams): this {
        const maxSettings = toLimit(...params as Parameters<typeof toLimit>)
        return this._applySubValidator('max', maxSettings)
    }

}

//// Tests ////

describe('extending schema with main and sub validators', () => {

    const $number = new NumberSchema()

    describe('named', () => {

        const $namedNumber = $number.named('Id')

        testValidator<unknown, number>(
            $namedNumber,
            { asserts: -1 },
            { asserts: 0 },
            { asserts: 1 },
            { asserts: NaN, error: 'Must be a Id' }
        )

    })

    describe('positive', () => {

        const $positiveNumber = $number.positive()

        testValidator(
            $positiveNumber,
            { asserts: -1, error: 'Must be a positive Number' },
            { asserts: 0 },
            { asserts: 1 },
        )

    })

    describe('message', () => {

        const $messageValidator = $number.message('Must be Numeric')

        testValidator(
            $messageValidator,
            { asserts: -1 },
            { asserts: 0 },
            { asserts: 1 },
            { asserts: NaN, error: 'Must be Numeric' },
        )

    })

    describe('limit', () => {

        const $0to100 = $number.min(0).max(100)

        testValidator(
            $0to100,
            { asserts: 99 },
            { asserts: 100, error: 'Must be less than 100' },
            { asserts: 0 },
            { asserts: -1, error: 'Must be greater than or equal to 0' },
        )

        const $lessThan100 = $0to100.min(false)
        testValidator(
            $lessThan100,
            { asserts: 99 },
            { asserts: 100, error: 'Must be less than 100' },
            { asserts: 0 },
            { asserts: -1 },
        )

        const $above0 = $0to100.max(false).min({ value: 0, inclusive: false })
        testValidator(
            $above0,
            { asserts: 99 },
            { asserts: 0, error: 'Must be greater than 0' }
        )

    })

})

