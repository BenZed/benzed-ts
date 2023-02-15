import { isNumber, isString, nil } from '@benzed/util'

import { Shape } from './shape'
import { ConfigurableTypeValidator } from '../validators'
import { testValidator, testValidationContract } from '../util.test'
import { ReadOnly, Optional } from '@benzed/schema'

import { expectTypeOf } from 'expect-type'

//// Tests ////

const $number = new class Number extends ConfigurableTypeValidator<number> {
    isValid = isNumber
}

const $vector = new Shape({
    x: $number,
    y: $number
})//.named('Vector') 

const $positiveVector = $vector
    .asserts(v => v.x >= 0 && v.y >= 0, 'Must be positive.')

describe(`${$vector.name} validator contract tests`, () => {

    testValidationContract( 
        $vector,
        {
            validInput: { x: 0, y: 0 },
            invalidInput: { x: 'ace' }
        }
    )
})

describe(`${$vector.name} validator tests`, () => {

    testValidator(
        $vector,
        { asserts: { x: 0, y: 0 } },
        { asserts: { x: NaN }, error: 'Must be a Number' }
    )

})

it('.properties', () => {
    expect($vector.properties.x).toBe($number)
    expect($vector.properties.y).toBe($number)
})

it('output type respects mutators', () => {

    const $string = new class String extends ConfigurableTypeValidator<string> {
        isValid = isString
    }

    const $name = new Shape({
        nick: new Optional($string),
        first: new ReadOnly($string),
        last: new ReadOnly($string)
    })

    const name = $name({
        nick: 'The Goose',
        first: 'Steve',
        last: 'Goser'
    })

    expectTypeOf(name).toEqualTypeOf<{
        nick?: string
        readonly first: string
        readonly last: string
    }>()

}) 
 
describe('builder methods', () => {

    testValidator(
        $positiveVector,
        { asserts: { x: 0, y: 0 } },
        { asserts: { x: -1, y: 0 }, error: 'Must be positive.' },
    )

    const minX = $vector 
        .transforms(v => v.x < 0 ? { ...v, x: 0 } : v, 'X must be positive')

    testValidator(
        minX,
        { transforms: { x: -1, y: 0 }, output: { x: 0, y: 0 } },
        { asserts: { x: -1, y: 0 }, error: 'X must be positive' }
    )

    describe('property()', () => {

        const $vectorOptionalX = $positiveVector
            .property('x', x => new Optional(x))

        const output = $vectorOptionalX({ x: 0, y: 0 })

        expectTypeOf(output).toEqualTypeOf<{
            x?: number
            y: number
        }>()
 
        testValidator<object, typeof output>(
            $vectorOptionalX,
            { transforms: { y: 0 } },

            // no error, as builder methods were removed
            { transforms: { y: -1 } },
        )

    })

    it('pick', () => {
        const $justX = $positiveVector.pick('x')

        const justX = $justX({ x: -1, y: 0 })
        expect(justX).toEqual({ x: -1 })
    })

    it('omit', () => {
        const $justY = $positiveVector.omit('x')
        const justY = $justY({ x: 0, y: -1 })
        expect(justY).toEqual({ y: -1 })
    })

    it('merge', () => {

        const $z = new Shape({
            z: $number
        })

        for (const $vector3 of [
            $positiveVector.merge($z),
            $positiveVector.merge($z.properties)
        ]) {
            const vector3 = $vector3({ x: -1, y: -1, z: 0 })
            expect(vector3).toEqual({ x: -1, y: -1, z: 0 })
        }
    })

    it('partial', () => {
        const $partialVector = $positiveVector.partial()
        expect($partialVector({})).toEqual({})
    })

    it('merge overwrite', () => {

        const $groundVector = $positiveVector.merge({
            y: new Optional($number),
            z: $number
        })

        const v3 = $groundVector({ x: -1, z: 10 })
        expect(v3).toEqual({ x: -1, z: 10 })
    })

    it('default', () => {
        const $zero = $positiveVector.default(() => ({ x: 0, y: 0 }))
        expect($zero(nil)).toEqual({ x: 0, y: 0 })
    })

})
