import BooleanSchema from './boolean-schema'

const $bool = new BooleanSchema()

describe('validate()', () => {

    it('validates boolean values', () => {
        expect($bool.validate(true))
            .toEqual(true)

        expect($bool.validate(false))
            .toEqual(false)

        expect(() => $bool.validate('what'))
            .toThrow('what is not boolean')
    })

    it('casts "true" to true', () => {
        expect($bool.validate('true'))
            .toEqual(true)
    })

    it('casts "false" to false', () => {
        expect($bool.validate('false'))
            .toEqual(false)
    })

})
