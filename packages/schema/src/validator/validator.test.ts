import { isInteger, isString } from '@benzed/util'
import { describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import { Validator } from './validator'

import { testValidator } from './util.test'

//// Tests ////

describe('isValid typeguard option', () => {

    const $string = new Validator({
        name: 'string',
        isValid: isString
    }) 

    it('equal type Validator<unknown,string>', () => {
        expectTypeOf($string).toEqualTypeOf<Validator<unknown,string>>()
    })

    testValidator($string, { input: 'hello', output: 'hello', transform: true })
    testValidator($string, { input: 'world', output: 'world', transform: false })
    testValidator($string, { input: 0, error: 'Must be string', transform: false })

    it('overridden methods are enumerable', () => {
        expect({ ...$string }).toHaveProperty('isValid', $string.isValid)
        expect({ ...$string }).not.toHaveProperty('transform')
    })
})
 
describe('isValid predicate option', () => {

    const $triangle = new Validator({
        isValid: (input: { sides: number }) => input.sides === 3,
        error: 'Must be a triangle'
    })

    it('equal type Validator<{ sides: number },{ sides: number }>', () => {
        expectTypeOf($triangle).toEqualTypeOf<Validator<{ sides: number },{ sides: number }>>()
    })

    testValidator($triangle, { input: { sides: 3 }, output: { sides: 3 }, transform: false })
    testValidator($triangle, { input: { sides: 3 }, output: { sides: 3 }, transform: true })
    testValidator($triangle, { input: { sides: 4 }, error: 'Must be a triangle', transform: false })

    it('overridden methods are enumerable', () => {
        expect({ ...$triangle }).toHaveProperty('isValid', $triangle.isValid)
        expect({ ...$triangle }).not.toHaveProperty('transform')
    })
})

describe('transform option', () => {

    const $lowerCaseString = new Validator({
        transform: (i: string) => i.toLowerCase(),
        error: 'Must be lower case string.'
    })
    
    it('equal type Validator<string,string>', () => {
        expectTypeOf($lowerCaseString).toEqualTypeOf<Validator<string, string>>()
    })

    testValidator($lowerCaseString, { input: 'Hello', output: 'hello', transform: true })
    testValidator($lowerCaseString, { input: 'world', output: 'world', transform: false })
    testValidator($lowerCaseString, { input: 'WHAT', error: 'Must be lower case', transform: false })

    it('overridden methods are enumerable', () => {
        expect({ ...$lowerCaseString }).toHaveProperty('transform', $lowerCaseString.transform)
        expect({ ...$lowerCaseString }).not.toHaveProperty('isValid')
    })
})

describe('transform and isValid predicate', () => {

    const $arrayOfIntegers = new Validator({

        isValid(input: number[]) {
            return input.every(isInteger)
        },

        transform(input) {
            return input.map(Math.floor)
        },

        error: 'Must be an array of integers'
    })

    it('equal type Validator<number[],number[]>', () => {
        expectTypeOf($arrayOfIntegers).toEqualTypeOf<Validator<number[], number[]>>()
    })

    testValidator($arrayOfIntegers, { input: [0.5], output: [0], transform: true })
    testValidator($arrayOfIntegers, { input: [1], output: [1], transform: true })
    testValidator($arrayOfIntegers, { input: [0.5], error: 'Must be an array of integers', transform: false })

    it('overridden methods are enumerable', () => {
        expect({ ...$arrayOfIntegers }).toHaveProperty('transform', $arrayOfIntegers.transform)
        expect({ ...$arrayOfIntegers }).toHaveProperty('isValid', $arrayOfIntegers.isValid)
    })

})

describe('transform and isValid typeguard', () => {

    const $id = new Validator({

        isValid(input: unknown): input is `id-${number}` {
            return typeof input === 'string' && /^id-\d+$/.test(input)
        },

        transform(input) {
            return typeof input === 'number'
                ? `id-${input}`
                : input
        }
    })

    it('equal type Validator<unknown, `id-${number}`>', () => {
        expectTypeOf($id).toEqualTypeOf<Validator<unknown, `id-${number}`>>()
    })

    testValidator($id, { input: 100, output: 'id-100', transform: true })
    testValidator($id, { input: 'id-100', output: 'id-100', transform: true })

    it('overridden methods are enumerable', () => {
        expect({ ...$id }).toHaveProperty('transform', $id.transform)
        expect({ ...$id }).toHaveProperty('isValid', $id.isValid)
    })

})

describe('spreading', () => {

    const $string = new Validator<unknown, string>({
        isValid(input) {
            return typeof input === 'string'
        },
        error: 'Must be a primitive'
    })

    const $number = new Validator<unknown, number>({
        ...$string,
        isValid(input) {
            return typeof input === 'number'
        }
    })

    it('updates type', () => {
        expectTypeOf($string)
            .toEqualTypeOf<Validator<unknown, string>>()

        expectTypeOf($number)
            .toEqualTypeOf<Validator<unknown, number>>()
    })
    
    testValidator($number, { input: 100, output: 100, transform: false })
    testValidator($number, { input: '100', error: 'Must be a primitive', transform: false })
})

describe('super validator', () => {

    const $buffer = new Validator({

        name: 'buffer',

        minLength: 1,

        isValid(input: number[]) {
            return input.length >= this.minLength && 
                input.every(i => i >= 0 && i < 256) && 
                input.every(isInteger)
        },

        error(): string {
            return `Must be a ${this.name} with at least ${this.minLength} bytes`
        }

    })

    it('equal type Validator<number[], number[]> & { minLength: number }>', () => {
        expectTypeOf($buffer).toEqualTypeOf<Validator<number[], number[]> & { minLength: number }>()
    })

    testValidator($buffer, { input: [0], output: [0], transform: false })
    testValidator($buffer, { input: [5], output: [5], transform: true })
})

describe('spreading a super validator', () => {

    const $triangle = new Validator({
        sides: 3,
        name: 'triangle',
        isValid(input: { sides: number }) {
            return input.sides === this.sides
        },
        error() {
            return `Must be a ${this.name} (${this.sides} sides)`
        }
    })

    const $square = new Validator({
        ...$triangle,
        sides: 4,
        name: 'quadrilateral'
    })

    it('equal type Validator<{ sides: number }, { sides: number }> & { sides: number }', () => {
        expectTypeOf($triangle)
            .toEqualTypeOf<Validator<{ sides: number }, { sides: number }> & { sides: number }>()

        expectTypeOf($square).toEqualTypeOf($triangle)
    })

    testValidator($square, { 
        input: { sides: 4 }, 
        output: { sides: 4 }, 
        transform: false 
    })

    testValidator($square, { 
        input: { sides: 3 }, 
        error: 'Must be a quadrilateral (4 sides)', 
        transform: false 
    })
})
