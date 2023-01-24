import { Infer, isString } from '@benzed/util'
import { expectTypeOf } from 'expect-type'
import { ValidationErrorMessage, Validator } from '../validator'

import { Cursor } from './cursor'

import { testValidator } from '../util.test'

//// Tests ////

describe('create cursor from validator', () => {
    const $string = new Validator({ isValid: isString })
    const $stringSchema = new Cursor($string)
    testValidator($stringSchema, { input: 'hello', output: 'hello', transform: false })
})

describe('automatic setters for validator options', () => {

    const $stringWithAtLeast3Chars = new Cursor({
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
            .toMatchTypeOf<Cursor<unknown, string, { minLength: number }>>()
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

    const $triangle = new Cursor({
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
            .toMatchTypeOf<Cursor<{ sides: number }, { sides: number }, {
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

    const _oneToFour = new Cursor(
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
