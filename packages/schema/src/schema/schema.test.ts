import { Schema } from './schema'

import { 
    ValidateOptions, 
    ValidationErrorMessage, 
    Validator 
} from '../validator'

import { testValidator } from '../util.test'
import { Infer, isString } from '@benzed/util'
import { expectTypeOf } from 'expect-type'

//// Tests ////

describe('created from generic validate method', () => {

    const $average = new Schema((i: number[]) => {
        if (i.length < 3)
            throw new Error('Must take the average of at least three numbers')

        return i.reduce((v, i) => i + v, 0) / i.length
    })

    testValidator($average, { input: [1, 2, 3], output: 2, transform: false })
    testValidator($average, { input: [1], error: 'ust take the average', transform: false })

    const $averageAbove5 = $average.asserts(i => i > 5, 'ust be higher than 5')
    testValidator($averageAbove5, { input: [ 1, 2, 3 ], error: 'ust be higher than 5', transform: false })
    testValidator($averageAbove5, { input: [ 4, 6, 8, 10 ], output: 7, transform: false })
})

it('created from generic transform', () => {
    const $parse = new Schema((i: string) => parseInt(i)).asserts(i => !Number.isNaN(i), v => `Could not convert "${v}" into a number.`)

    expect($parse('1')).toEqual(1)
    expect(() => $parse('ace')).toThrow('Could not convert "ace" into a number.')
})

describe('create cursor from validator', () => {
    const $string = new Validator({ isValid: isString })
    const $stringSchema = new Schema($string)
    testValidator($stringSchema, { input: 'hello', output: 'hello', transform: false })
})

describe('automatic setters for validator options', () => {

    const $stringWithAtLeast3Chars = new Schema({
        minLength: 3,
        isValid(i: unknown): i is string {
            return typeof i === 'string' && i.length >= this.minLength
        },
        error() { 
            return `Must be a string with at least ${this.minLength} chars.`
        }
    })

    it('type Schema<unknown, string, { minLength: number }>', () => {   
        expectTypeOf($stringWithAtLeast3Chars)
            .toMatchTypeOf<Schema<unknown, string, { minLength: number }>>()
    })

    testValidator($stringWithAtLeast3Chars, { input: 'aces', output: 'aces', transform: false })
    testValidator($stringWithAtLeast3Chars, { input: 'ace', output: 'ace', transform: false })
    testValidator($stringWithAtLeast3Chars, { input: 'ac', error: 'Must be a string with at least 3', transform: false })

    const $stringWithAtLeast4Chars = $stringWithAtLeast3Chars
        .minLength(4) 
        .error('See, you fucked up.')

    testValidator($stringWithAtLeast4Chars, { input: 'acer', output: 'acer', transform: false })
    testValidator($stringWithAtLeast4Chars, { input: 'ace', error: 'See, you fucked up', transform: false })
  
})  

describe('apply settings', () => {

    const $triangle = new Schema({
        name: 'triangle',
        sides: 3,
        isValid(input: { sides: number }): boolean {
            return input.sides === this.sides
        },
        error() {
            return `A ${this.name} must have ${this.sides} sides.`
        }
    })  

    it('type Schema<{ sides: number }, { sides: number }, { sides: number }>', () => {   
        expectTypeOf($triangle)
            .toMatchTypeOf<Schema<{ sides: number }, { sides: number }, {
            name: string
            error: string | ValidationErrorMessage<{ sides: number }>
            sides: number
        }>>()
    })

    testValidator($triangle, { input: { sides: 3 }, output: { sides: 3 }, transform: false})
    testValidator($triangle, { input: { sides: 4 }, error: 'triangle must have 3 sides', transform: false})

    const $quadrilateral = $triangle.copy().apply({ sides: 4, name: 'quadrilateral' }) 
    testValidator($quadrilateral, { input: { sides: 3 }, error: 'quadrilateral must have 4 sides', transform: false})

})

it('named remapping with a clean custom type', () => {

    const _oneToFour = new Schema(
        new Validator({
            options: [1,2,3,4],
            isValid(input: unknown): input is number {
                return this.options.includes(input)
            }
        })
    )

    interface OneToFour extends Infer<typeof _oneToFour> {
        options(input: number[]): this
        named(input: string): this
        error(input: string | ValidationErrorMessage<unknown>): this
    }

    const $oneToFour = (_oneToFour as OneToFour)
        .named('one-to-four')
        .error('Must be one to four') 

    expectTypeOf($oneToFour).toEqualTypeOf<OneToFour>()
}) 

describe('sub validators', () => {

    const $lowercase = new Validator({
        name: 'lowercase',
        transform: (i: string) => i.toLowerCase()
    }) 

    const $string = new Schema({

        name: 'string',
        isValid: isString,
        lowercase: $lowercase
    })
 
    describe('add sub validator', () => {
        const $lowerString = $string.lowercase()
        it('type match', () => {  
            expectTypeOf($lowerString).toEqualTypeOf($string)
        })
        testValidator($lowerString, { input: 0, error: 'Must be string', transform: true })
        testValidator($lowerString, { input: 'HELLO', output: 'hello', transform: true })
    })

    describe('remove sub validator', () => {
        const $string2 = $string.lowercase().lowercase(false)
        testValidator($string2, { input: 0, error: 'Must be string', transform: true })
    })

    describe('error shorthand', () => {
        const $noupperString = $string.lowercase('No uppercase letters allowed')
        testValidator($noupperString, { input: 'Hi', error: 'No uppercase letters allowed', transform: false })
    })

    describe.only('settings', () => {

        const $range = new Validator({
            name: 'range',
            error() {
                const max = isFinite(this.max) 
                const min = isFinite(this.min)
                const inc = this.inclusive 
    
                const detail = min && max 
                    ? `between ${this.min} and ${inc ? 'equal to ' : ''}${this.max}`
                    : min 
                        ? `equal or above ${this.min}`
                        : `${inc ? 'equal to or ' : ''}below ${this.max}`
    
                return `Must be ${detail}`
            },
            isValid(input: number) {
                return input >= this.min && (
                    this.inclusive 
                        ? input <= this.max
                        : input < this.max
                )
            },
            inclusive: false,
            min: -Infinity,
            max: Infinity
        })
    
        const $number = new Schema({
            name: 'number',
            isValid: (i: unknown): i is number => typeof i === 'number',
            range: $range
        })

        const $age = $number.named('age')

        const $youngPersonAge = $age.range({ min: 18, max: 35 })

        it('settings for uninitialized validators not included', () => {
            expect($number.settings).toEqual({
                name: 'number',
                error: 'Must be number.'
            })
        })

    })
})

