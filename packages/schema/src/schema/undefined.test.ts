import UndefinedSchema from './undefined'

const $undefined = new UndefinedSchema()

describe('validate()', () => {

    it('validates undefined values', () => {
        expect($undefined.validate(undefined))
            .toEqual(undefined)

        expect($undefined.validate(undefined))
            .toEqual(undefined)

        expect(() => $undefined.validate(100))
            .toThrow('100 is not undefined')
    })

    it('casts null values to undefined', () => {
        expect($undefined.validate(null))
            .toEqual(undefined)
    })

    it('casts string "undefined" to undefined', () => {
        expect($undefined.validate('undefined'))
            .toEqual(undefined)
    })

})

describe('default()', () => {
    it('overridden to take no arguments', () => {
        expect($undefined.default().validate(undefined)).toBe(undefined)
    })
})