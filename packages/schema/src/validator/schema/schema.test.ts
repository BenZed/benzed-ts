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

import { Trait } from '@benzed/traits'

import { Structural } from '@benzed/immutable'

import { SignatureParser } from '@benzed/signature-parser'

import { testValidator } from '../../util.test' 
import { ContractValidator, TypeValidator } from '../validators'
import { ValidationErrorMessage } from '../../validation-error'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Main Validators ////

class NumberValidator extends Trait.add(TypeValidator<number>, Structural) {

    isValid(value: unknown): value is number {
        return isNumber(value) && (!this.positive || value >= 0)
    }

    readonly name: string = 'Number' 

    readonly positive: boolean = false  

    readonly message: ValidationErrorMessage<unknown, number> = 
        function (): string {
            return [
                'Must be a',
                this.positive ? 'positive' : '',
                this.name
            ].filter(isNotEmpty).join(' ')
        }

    //// State ////
    
    get [Structural.state](): Pick<this, 'name' | 'positive' | 'message'> {
        return pick(this, 'name', 'positive', 'message')
    }

    set [Structural.state]({ name, positive, message }: Pick<this, 'name' | 'positive' | 'message'>) {
        assign(this, { positive, message })
        define.named(name, this)
    }

}

//// Sub Validators ////

class SubContractValidator<T> extends ContractValidator<T,T> {
    enabled = false
}

abstract class LimitValidator<O extends '>' | '<'> extends Trait.add(SubContractValidator<number>, Structural) {

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
    readonly message: ValidationErrorMessage<number> =     
        function () {

            const valueDetail = this.operator === '>'
                ? 'less than'
                : 'greater than'

            const inclusiveDetail = this.inclusive 
                ? ' or equal to'
                : ''

            const detail = valueDetail + inclusiveDetail

            return `Must be ${detail} ${this.value}`
        }

    get [Structural.state](): Pick<this, 'enabled' | 'message' | 'value' | 'inclusive'> {
        return pick(this, 'enabled', 'message', 'value', 'inclusive')
    }

    set [Structural.state](state: Pick<this, 'enabled' | 'message' | 'value' | 'inclusive'>) {
        assign(this, state)
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

    named(name: string): this {
        return this._applyMainValidator({ name })
    }

    positive(positive = true): this { 
        return this._applyMainValidator({ positive })
    }

    message(message: ValidationErrorMessage<unknown>): this {
        return this._applyMainValidator({ message })
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

