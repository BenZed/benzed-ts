import { Validator } from './validator'

import { testValidator } from '../util.test'
import { isBoolean, isInteger, isString } from '@benzed/util'
import { copy } from '@benzed/immutable'

import { expectTypeOf } from 'expect-type'

//// Tests ////

describe('construct with default settings', () => {

    const $string = new Validator({
        name: 'string',
        isValid: isString
    })

    expectTypeOf($string).toEqualTypeOf<Validator<unknown, string>>()

    testValidator($string,
        { input: 0, error: 'Must be string', transform: false }
    )

    const $trim = new Validator({
        name: 'trimmed',
        transform(i: string) {
            return i.trim()
        }
    })
    expectTypeOf($trim).toEqualTypeOf<Validator<string, string>>()
    testValidator($trim,
        { input: ' ace ', output: 'ace', transform: true },
        { input: ' ace ', error: 'ust be trimmed', transform: false }
    )

    const $blank = new Validator({})

    expect($blank)
})

describe('construct with extra settings', () => {

    const hasEnoughChars = function (this: { numChars: number }, i: string): boolean {
        return i.length >= this.numChars
    }
    
    describe('isValid', () => {
        
        const $has3Chars = new Validator({
            name: 'term',
            numChars: 3,
            isValid: hasEnoughChars,
            error(): string {
                return `Must have ${this.numChars} chars`
            }
        })

        expectTypeOf($has3Chars).toEqualTypeOf<Validator<string, string> & {
            numChars: number
        }>()

        testValidator($has3Chars, { input: 'ace', output: 'ace', transform: false })
        testValidator($has3Chars, { input: 'ac', error: 'Must have 3 chars', transform: false })
        
        const $has4Chars = new Validator({ ...$has3Chars, numChars: 4 })
        testValidator($has4Chars, { input: 'acer', output: 'acer', transform: false })
        testValidator($has4Chars, { input: 'ace', error: 'Must have 4 chars', transform: false })
        expectTypeOf($has4Chars).toEqualTypeOf<Validator<string, string> & {
            numChars: number
        }>()

        it('retains isValid setting on spread', () => {
            expect($has3Chars.isValid).toBe(hasEnoughChars)
            expect($has4Chars.isValid).toBe(hasEnoughChars)
        })

        it('does not retain isValid on apply', () => {
            
            const $bad = Validator.apply($has3Chars, { 
                // @ts-expect-error Not allowed to apply isValid 
                isValid() { 
                    return false
                }
            })

            expect($bad.isValid).toEqual($has3Chars.isValid)
        })
    })

    describe('transform', () => {

        const $lowerCase = new Validator({
            name: 'casing',
            transform(i: string) {
                const casing = this.case
                switch (casing) {
                    case 'lower': {
                        return i.toLowerCase()
                    }
                    case 'upper': {
                        return i.toUpperCase()
                    }
                    default: {
                        const casingBad: never = casing
                        throw new Error(`${casingBad} is an invalid option.`)
                    }
                }
            },
            case: 'lower' as 'lower' | 'upper',
            error() {
                return `Must be ${this.case} case`
            } 
        })

        testValidator($lowerCase, 
            { input: 'Ace', output: 'ace', transform: true },
            { input: 'Ace', error: 'ust be lower case', transform: false }
        )

        const $upperCase = new Validator({ ...$lowerCase, case: 'upper' })
        testValidator($upperCase, 
            { input: 'Ace', output: 'ACE', transform: true },
            { input: 'Ace', error: 'ust be upper case', transform: false }
        )

        it('retains transform setting on spread', () => {
            expect($upperCase.transform).toBe($lowerCase.transform)
        })

        it('does not retain transform on apply', () => {
            
            const $bad = Validator.apply($lowerCase, {
                // @ts-expect-error Not allowed to apply transform 
                transform() { 
                    return false
                }
            })

            expect($bad.transform).toEqual($lowerCase.transform)
        })
    })
})

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

        transform(input: number[]) {
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

describe('copy', () => {

    const $b1 = new Validator({
        name: 'boolean',
        isValid: isBoolean
    }) 

    const $b2 = copy($b1)

    expect($b2).not.toBe($b1)
 
})
