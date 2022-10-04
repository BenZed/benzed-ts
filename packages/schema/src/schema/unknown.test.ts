import UnknownSchema from './unknown'

const $unknown = new UnknownSchema()

describe('validate()', () => {

    it('validates any value', () => {
        expect($unknown.validate(1))
            .toEqual(1)

        expect($unknown.validate(true))
            .toEqual(true)

        expect($unknown.validate({}))
            .toEqual({})
    })

})
