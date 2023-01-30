import { isInteger } from '@benzed/util'

import { SubValidation } from './sub-validation'

import { Schema, ValidationErrorInput, Validator } from '../validator'

import { testValidator } from '../util.test'

//// Types //// 

class Length extends Validator<number[], number[]> {
    constructor(
        readonly length: number, 
        error?: ValidationErrorInput<number[]>
    ) {
        super({
            isValid(input: number[]) {
                return this.length === input.length
            },
            error
        })
    }
}

class AlphaNumeric extends Schema<number[]> {
    constructor() {
        super({
            isValid(input: number[]) {

                for (const integer of input) {
                    const char = String.fromCharCode(integer)
                    if (!/[a-z]|\d/i.test(char))
                        return false
                }

                return true 
            },
            error: 'Bytes must represent alpha-numeric characters'
        })
    }
}

const $$alphaNumeric = Symbol('alpha-numeric-validator')

class Buffer extends Schema<number[]> {

    constructor(
        error: ValidationErrorInput<number[]> = 'Must be a buffer.'
    ) {
        super({
            isValid(input: number[]) {
                return input.every(isInteger) && 
                    input.every(n => n >= 0 && n <= 255)
            },
            error
        }) 
    } 

    length = new SubValidation(Length, this)

    alphaNumeric = new SubValidation(AlphaNumeric, this, $$alphaNumeric)

    friendly = new SubValidation(AlphaNumeric, this, $$alphaNumeric)
} 

//// Setup ////

const $buffer = new Buffer()
const $10Buffer = $buffer.length(10, 'Must have 10 bytes')

//// Tests ////

testValidator(
    $10Buffer,
    'enabled',
    { input: [0], error: 'Must have 10 bytes' },
    { input: [0,1,2,3,4,5,6,7,8,9], outputSameAsInput: true }
)

testValidator(
    $10Buffer.length(false),
    'disabled',
    { input: [0], outputSameAsInput: true }
)

testValidator(
    $10Buffer.length(5, 'Must have 5 bytes, now.'),
    'updated', 
    { input: [0], error: 'ust have 5 bytes, now.' },
    { input: [0,1,2,3,4], outputSameAsInput: true }
)

testValidator(
    $buffer.alphaNumeric(),
    'sub schemas work as well',
    { input: 'hello'.split('').map(c => c.charCodeAt(0)), outputSameAsInput: true },
    { input: [0], error: 'Bytes must represent alpha-numeric characters' }
) 

testValidator(
    $buffer.alphaNumeric().friendly(false),
    'respects ids',
    { input: [0], outputSameAsInput: true } // proves alphNumeric and friendly use the same id
)