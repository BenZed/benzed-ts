import NullSchema from './null'

const $null = new NullSchema()

describe('validate()', () => {

    it('validates null values', () => {
        expect($null.validate(null))
            .toEqual(null)

        expect(() => $null.validate(100))
            .toThrow('100 is not null')
    })

    it('casts undefined values to undefined', () => {
        expect($null.validate(undefined))
            .toEqual(null)
    })

    it('casts string "null" to undefined', () => {
        expect($null.validate('null'))
            .toEqual(null)
    })

})

describe('default()', () => {
    it('overridden to take no arguments', () => {
        expect($null.default().validate(undefined)).toBe(null)
    })
})