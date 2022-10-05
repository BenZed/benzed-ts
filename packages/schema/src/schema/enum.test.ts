import EnumSchema from './enum'

const $trafficLights = new EnumSchema(['red', 'green', 'yellow'] as const)

describe('validate()', () => {

    it('validates enumerated values', () => {
        expect($trafficLights.validate('green'))
            .toEqual('green')

        expect($trafficLights.validate('red'))
            .toEqual('red')

        expect(() => $trafficLights.validate('what'))
            .toThrow('must be red, green or yellow')
    })

})

describe('default()', () => {

    it('creates schema with default enum', () => {
        expect($trafficLights.default('yellow').validate(undefined))
            .toEqual('yellow')
    })

    it('defaults to first input enum', () => {
        expect($trafficLights.default().validate(undefined))
            .toBe('red')
    })

})
