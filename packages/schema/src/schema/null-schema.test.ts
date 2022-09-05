import NullSchema from './null-schema'

const $null = new NullSchema()

describe('validate()', () => {

    it('validates undefined values', () => {
        expect($null.validate(undefined))
            .toEqual(null)
    })

    it('casts falsy values to undefined', () => {
        for (const falsy of [0, false, undefined, '', null]) {
            expect($null.validate(falsy))
                .toEqual(null)
        }
    })

    it('casts string "null" to undefined', () => {
        expect($null.validate('null'))
            .toEqual(null)
    })

})
