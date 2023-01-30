import { $number } from './number'
import * as Math from '@benzed/math' 

import { it, expect, describe } from '@jest/globals'

//// Export ////

it('validates number values', () => {

    expect($number(100))
        .toEqual(100)

    expect($number(100))
        .toEqual(100)
 
}) 

it('does not allow NaN', () => {
    expect(() => $number.validate(NaN))
        .toThrow('Must be number')
})

it('does not allow Infinity', () => {
    expect(() => $number.finite().validate(Infinity)) 
        .toThrow('Must be finite')
})

it('casts strings to numbers', () => {
    for (const n of [
        '0',
        '100',
        '1000',
        ' 123.123e',
        '-1230',
        '32.402a31' 
    ]) { 
        expect($number.validate(n))
            .toEqual(parseFloat(n))
    }
})

describe('range()', () => {

    it('creates an instance of the schema with a range validator', () => {

        const isTwoToTen = $number.range(2, 10)

        expect(isTwoToTen.validate(2)).toEqual(2)
        expect(() => isTwoToTen.validate(0))
            .toThrow('Must be equal or above 2 and below 10')
    })

    it('range() shortcut args', () => {

        const range5to10s = [
            $number.range(5, 10),
            $number.range(5, '..', 10),
            $number.range({ min: 5, max: 10, comparator: '..' }),
        ]

        for (const range5to10 of range5to10s) {
            expect(range5to10.validate(5)).toBe(5)
            expect(range5to10.validate(7)).toBe(7)
            expect(() => range5to10.validate(10)).toThrow('Must be equal or above 5 and below 10')
        }
    }) 

    it('== shortcut', () => {
        const equals2 = $number.range('==', 2)
        expect(equals2.validate(2)).toEqual(2)
        expect(() => equals2.validate(1))
            .toThrow('Must be equal 2')
        expect(() => equals2.validate(3))
            .toThrow('Must be equal 2')
    })
})

describe('default()', () => {

    it('respects default setting, if valid', () => {
        expect($number.default(5).validate(undefined)).toEqual(5)
    })

    it('defaults are respected across copies', () => {
        expect(() => $number.validate(undefined)).toThrow('Must be number')
        expect(() => $number.floor(1).validate(undefined)).toThrow('Must be number')
    })

})

for (const method of ['round', 'floor', 'ceil'] as const) {

    describe(`${method}()`, () => {

        it(`creates an instance of the schema with a ${method} validator`, () => {
            const $evenNumber = $number[method](2)

            const input = 3 

            expect($evenNumber.validate(input)).toBe(Math[method](input, 2))
        })

        it(`${method}() shortcuts`, () => {

            const precision = 0.125

            const toEighths = [
                $number[method](precision)
            ]

            const input = 0.1

            for (const toEigth of toEighths) {
                expect(toEigth.validate(input))
                    .toEqual(Math[method](input, precision))
            }
        })

    })
}

