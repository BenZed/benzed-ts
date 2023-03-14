import { Schema } from './schema'

import {
    isNumber,
    isString,
    through as isNotEmpty,
    pick,
    isBoolean,
    isOptional,
    assign,
    isUnion,
    isFunc,
    define
} from '@benzed/util'

import { SignatureParser } from '@benzed/signature-parser'

import { testValidator } from '../../util.test' 
import { ContractValidator, TypeValidator } from '../validators'
import { ValidationErrorMessage } from '../../validation-error'
import { Validator } from '../validator'
import ValidationContext from '../../validation-context'

import { describe } from '@jest/globals'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

//// Main Validators ////

class NumberValidator extends TypeValidator<number> {

    override isValid(value: unknown): value is number {
        return isNumber(value) && (!this.positive || value >= 0)
    }

    readonly positive: boolean = false  

    override message(input: number, ctx: ValidationContext<number>) {
        void input
        void ctx
        return [
            'Must be a',
            this.positive ? 'positive' : '',
            this.name
        ].filter(isNotEmpty).join(' ')
    }

    //// State ////
    
    get [Validator.state](): Pick<this, 'name' | 'positive' | 'message'> {
        return pick(this, 'name', 'positive', 'message')
    }

    set [Validator.state]({ name, positive, message }: Pick<this, 'name' | 'positive' | 'message'>) {
        assign(this, { positive, message })
        define.named(name, this)
    }

}

//// Sub Validators ////

class SubContractValidator<T> extends ContractValidator<T,T> {
    enabled = false
}

abstract class LimitValidator<O extends '>' | '<'> extends SubContractValidator<number> {

    abstract get operator(): O

    constructor(
        readonly value: number,
        readonly inclusive: boolean
    ) {
        super()
    } 

    override isValid(value: number): boolean { 
        return this.operator === '>'
            ? this.inclusive 
                ? this.value >= value 
                : this.value > value 
            : this.inclusive 
                ? this.value <= value 
                : this.value < value
    }
    override message(input: number, ctx: ValidationContext<number>) {
        void input
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

    get [Validator.state](): Pick<this, 'name' | 'enabled' | 'message' | 'value' | 'inclusive'> {
        return pick(this, 'name', 'enabled', 'message', 'value', 'inclusive')
    }

    set [Validator.state]({ name, ...rest }: Pick<this, 'name' | 'enabled' | 'message' | 'value' | 'inclusive'>) {
        define.named(name, this)
        assign(this, rest)
    }

}

const toLimit = new SignatureParser({
    enabled: isOptional(isBoolean),
    message: isOptional(isUnion(isString, isFunc)),
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
    override readonly enabled: boolean = false
}

class MaxValidator extends LimitValidator<'>'> {
    get operator(): '>' {
        return '>'
    }
    override readonly enabled: boolean = false 
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

    min(...params: ToLimitParams): this {
        const minSettings = toLimit(...params as Parameters<typeof toLimit>) as any
        return this._applySubValidator('min', minSettings)
    } 

    max(...params: ToLimitParams): this {
        const maxSettings = toLimit(...params as Parameters<typeof toLimit>) as any
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

