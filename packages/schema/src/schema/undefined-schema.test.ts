import UndefinedSchema from './undefined-schema'

const $undefined = new UndefinedSchema()

describe('validate()', () => {

    it('validates undefined values', () => {
        expect($undefined.validate(undefined))
            .toEqual(undefined)
    })

    it('casts falsy values to undefined', () => {
        for (const falsy of [0, false, undefined, '', null]) {
            expect($undefined.validate(falsy))
                .toEqual(undefined)
        }
    })

    it('casts string "undefined" to undefined', () => {
        expect($undefined.validate('undefined'))
            .toEqual(undefined)
    })

})
