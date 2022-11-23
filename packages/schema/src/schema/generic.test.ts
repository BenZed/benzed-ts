import GenericSchema from './generic'

const $generic = new GenericSchema((i): i is 1 => i === 1)

describe('validate()', () => {

    it('validates against provided input typeguard', () => {
        expect($generic.validate(1))
            .toEqual(1)

        expect(() => $generic.validate(true))
            .toThrow('true is invalid')
    })

})