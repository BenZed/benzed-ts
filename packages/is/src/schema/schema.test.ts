import { Infer } from '@benzed/util'
import { expectTypeOf } from 'expect-type'
import { ValidateOptions, ValidationErrorMessage, Validator } from '../validator'
import { Schema } from './schema'

it('generates setters for updating validator options', () => {

    const $stringWithAtLeast3Chars = new Schema({
        minLength: 3,
        is(i): i is string {
            return typeof i === 'string' && i.length >= this.minLength
        },
        error() {
            return `Must be a string with at least ${this.minLength} chars.`
        }
    })

    expect($stringWithAtLeast3Chars('123')).toEqual('123') 

    const $stringWithAtLeast4Chars = $stringWithAtLeast3Chars
        .minLength(4)
        .error(() => 'See, you fucked up.')
    
    expect($stringWithAtLeast4Chars('1234')).toEqual('1234')
    expect(() => $stringWithAtLeast4Chars('123')).toThrow('See, you fucked up.')
})

it('can form a schema out of just an is method', () => {

    const $triangle = new Schema({
        name: 'triangle',
        sides: 3,
        is(input: { sides: number }): boolean {
            return input.sides === this.sides
        },
        transform(input: { sides: number }) {
            return `${input}`
        }, 
        error() {
            return `A ${this.name} must have ${this.sides} sides.`
        }
    })

    expect($triangle({ sides: 3 })).toEqual({ sides: 3 })
    expect(() => $triangle({ sides: 4 })).toThrow('A triangle must have 4 sides.')

    const $quadrilateral = $triangle.apply({ sides: 4, name: 'quadrilateral' })
    expect(() => $quadrilateral({ sides: 3 })).toThrow('A quadrilateral must have 4 sides.')

})

it('can take a generic validator', () => {
    const $average = new Schema((i: number[]) => {
        if (i.length < 3)
            throw new Error('Must take the average of at least three numbers')

        return i.reduce((v, i) => i + v, 0) / i.length
    })
    expect(() => $average([2])).toThrow('Must take the average of at least three numbers')

    const $averageAbove5 = $average.asserts(i => i > 5, 'Must be higher than 5')
    expect(() => $averageAbove5([3,4,4])).toThrow('Must be higher than 5')
})

it('can take a generic transform', () => {

    const $parse = new Schema((i: string) => parseInt(i))   
        .asserts(i => !Number.isNaN(i), v => `Could not convert "${v}" into a number.`)

    expect($parse('1')).toEqual(1)
    expect(() => $parse('ace')).toThrow('Could not convert "ace" into a number.')

    console.log($parse)
})

it('named remapping with a clean custom type', () => {

    const _oneToFour = new Schema(
        new Validator({
            options: [1,2,3,4],
            is(input: unknown): input is number {
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

