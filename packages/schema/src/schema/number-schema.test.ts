import NumberSchema from './number-schema'
import { expectValidationError } from '../util.test'

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

describe('range()', () => {

    it('creates an instance of the schema with a range validator', () => {

        const $twoToTen = $number.range(2, 10)

        expect($twoToTen.validate(2)).toEqual(2)
        expectValidationError(() => $twoToTen.validate(0))
            .toHaveProperty('message', '0 must be from 2 to less than 10')
    })

})
