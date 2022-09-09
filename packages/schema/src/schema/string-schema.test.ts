import StringSchema from './string-schema'

const $string = new StringSchema()

describe('validate()', () => {

    it('validates string values', () => {
        expect($string.validate('hello'))
            .toEqual('hello')

        expect(() => $string.validate(true))
            .toThrow('true is not string')
    })

    it('casts numbers to strings', () => {
        for (const number of [0, 100, 1000, Infinity]) {
            expect($string.validate(number))
                .toEqual(number.toString())
        }
    })

    it('casts arrays to joined strings', () => {
        expect($string.validate([0, 1, 2, 3, 4]))
            .toEqual('0,1,2,3,4')
    })

})

describe('trim()', () => {

    it('transforms strings to remove whitespace', () => {
        const $trimmedString = $string.trim()

        expect($trimmedString.validate('  ace  ')).toEqual('ace')
    })

    it('allows optional error', () => {
        const $trimmedString = $string.trim({ error: 'no whitespace allowed' })
        expect(() => $trimmedString.assert('  ace  ')).toThrow('no whitespace allowed')
    })

})
