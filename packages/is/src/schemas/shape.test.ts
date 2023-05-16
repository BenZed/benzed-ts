import { isString, nil } from '@benzed/util'

import { Shape } from './shape'
import { testValidator } from '../util.test'
import { ReadOnly, Optional, TypeValidator } from '@benzed/schema'

import { expectTypeOf } from 'expect-type'
import { $number, $boolean, $string } from './types'

import { it, expect, describe } from '@jest/globals'

//// Tests ////

const $vector = new Shape({
    x: $number,
    y: $number
}).named('Vector')

const $positiveVector = $vector
    .asserts(v => v.x >= 0 && v.y >= 0, 'must be positive.')

describe(`${$vector.name} validator tests`, () => {
    testValidator(
        $vector,
        { asserts: { x: 0, y: 0 } },
        { asserts: { x: NaN }, error: 'must be Number' }
    )
})

it('.properties', () => {
    expect($vector.properties.x).toBe($number)
    expect($vector.properties.y).toBe($number)
})

it('output type respects mutators', () => { 

    const $string = new class String extends TypeValidator<string> {
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
        { asserts: nil, error: 'must be Vector' },
        { asserts: { x: 0, y: 0 } },
        { asserts: { x: -1, y: 0 }, error: 'must be positive' },
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
 
        testValidator<unknown, typeof output>(
            $vectorOptionalX,
            { transforms: { y: 0 } },

            // no error, as builder methods were removed
            { transforms: { y: -1 } },
        )

    }) 

    it('pick', () => {
        const $justX = $positiveVector.pick('x')
        const justX = $justX({ x: 1, y: 0 })
        expect(justX).toEqual({ x: 1 })
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
        const $partialVector = $positiveVector.partial
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

    describe('strict', () => {

        const $sheet = new Shape({ score: $number }).strict(false)

        testValidator(
            $sheet,
            { transforms: { score: 5, name: 'larry' } },
            { asserts: { score: 5, name: 'larry' } },
        )
    })
})

/**
 * Fixing a bug where boolean validators in shapes weren't working
 */
describe('todo shape', () => {

    const $todo = new Shape({
        completed: $boolean,
        description: $string
    })

    testValidator(
        $todo,
        { asserts: { completed: false, description: 'Fix bug' } },
    )

})

