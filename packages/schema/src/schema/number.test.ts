import NumberSchema from './number'
import { expectValidationError } from '../util.test'

import * as Math from '@benzed/math'

const $number = new NumberSchema()

describe('validate()', () => {

    it('validates number values', () => {
        expect($number.validate(100))
            .toEqual(100)

        expect($number.validate(100))
            .toEqual(100)
    })

    it('does not allow NaN', () => {
        expect(() => $number.validate(NaN))
            .toThrow('NaN is not number')
    })

    it('does not allow Infinity', () => {
        expect(() => $number.validate('NaN'))
            .toThrow('NaN is not number')
    })

    it('casts strings to numbers', () => {
        for (const number of [
            '0',
            '100',
            '1000',
            ' 123.123e',
            '-1230',
            '32.402a31'
        ]) {
            expect($number.validate(number))
                .toEqual(parseFloat(number))
        }
    })

})

describe('default()', () => {

    it('input can be used as default', () => {
        const $defaultNum = new NumberSchema(1)
        expect($defaultNum.validate(undefined)).toEqual(1)
    })

    it('default()s to 0', () => {
        expect($number.default().validate(undefined)).toBe(0)
    })

    it('respects default setting, if valid', () => {
        expect($number.default(5).validate(undefined)).toEqual(5)
    })

})

describe('range()', () => {

    it('creates an instance of the schema with a range validator', () => {

        const $twoToTen = $number.range(2, 10)

        expect($twoToTen.validate(2)).toEqual(2)
        expectValidationError(() => $twoToTen.validate(0))
            .toHaveProperty('message', '0 must be from 2 to less than 10')
    })

    it('range() shortcut args', () => {

        const range5to10s = [
            // $number.range({ min: 5, max: 10 }),
            // $number.range(5, 10),
            // $number.range(5, '-', 10),
            $number.range(5, '..', 10),
            // $number.range({ min: 5, max: 10, comparator: '-' }),
            // $number.range({ min: 5, max: 10, comparator: '..' }),
        ]

        for (const range5to10 of range5to10s) {
            expect(range5to10.validate(5)).toBe(5)
            expect(range5to10.validate(7)).toBe(7)
            expect(() => range5to10.validate(10)).toThrow('must be from 5 to less than 10')
        }
    })

    it('== shortcut', () => {
        const equals2 = $number.range(2)
        expect(equals2.validate(2)).toEqual(2)
        expectValidationError(() => equals2.validate(1))
            .toHaveProperty('message', '1 must be equal 2')
        expectValidationError(() => equals2.validate(3))
            .toHaveProperty('message', '3 must be equal 2')
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
                $number[method](precision),
                $number[method]({ precision })
            ]

            const input = 0.1

            for (const toEigth of toEighths) {
                expect(toEigth.validate(input))
                    .toEqual(Math[method](input, precision))
            }
        })

    })
}