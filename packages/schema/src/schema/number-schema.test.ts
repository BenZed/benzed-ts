import NumberSchema from './number-schema'

const $number = new NumberSchema()

describe('validate()', () => {

    it('validates number values', () => {
        expect($number.validate(100))
            .toEqual(100)

        expect($number.validate(100))
            .toEqual(100)
    })

    it('does not allow NaN', () => {
        expect(() => $number.validate(NaN)).toThrow('NaN is not number')
    })

    it('does not allow Infinity', () => {
        expect(() => $number.validate('NaN')).toThrow('NaN is not number')
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
