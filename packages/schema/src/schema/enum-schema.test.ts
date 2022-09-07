import EnumSchema from './enum-schema'

const $trafficLights = new EnumSchema(['red', 'green', 'yellow'] as const)

describe('validate()', () => {

    it('validates enumerated values', () => {
        expect($trafficLights.validate('green'))
            .toEqual('green')

        expect($trafficLights.validate('red'))
            .toEqual('red')

        expect(() => $trafficLights.validate('what'))
            .toThrow('what is not red, green or yellow')
    })

})
