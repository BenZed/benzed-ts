import RangeValidator from './range-validator'

describe('unary comparators', () => {

    it('== creates an equal-to validator', () => {
        const equalTo10 = new RangeValidator({ comparator: '==', value: 10 })
        expect(equalTo10.validate(10)).toBe(10)
        expect(() => equalTo10.validate(9)).toThrow('must be equal 10')
    })

    it('<= creates a less-than-or-equal-to validator', () => {
        const lessThanOrEqualTo5 = new RangeValidator({ comparator: '<=', value: 5 })
        expect(lessThanOrEqualTo5.validate(4)).toBe(4)
        expect(() => lessThanOrEqualTo5.validate(6)).toThrow('must be equal or below 5')
    })

    it('< creates a less-than validator', () => {
        const lessThan50 = new RangeValidator({ comparator: '<', value: 50 })
        expect(lessThan50.validate(42)).toBe(42)
        expect(() => lessThan50.validate(50)).toThrow('must be below 50')
    })

    it('> creates a more-than validator', () => {
        const moreThan25 = new RangeValidator({ comparator: '>', value: 25 })
        expect(moreThan25.validate(42)).toBe(42)
        expect(() => moreThan25.validate(24)).toThrow('must be above 25')
    })

    it('>= creates a more-than validator', () => {
        const moreThanOrEqual10 = new RangeValidator({ comparator: '>=', value: 10 })
        expect(moreThanOrEqual10.validate(42)).toBe(42)
        expect(() => moreThanOrEqual10.validate(8)).toThrow('must be above or equal 10')
    })

})

describe('binary comparators', () => {

    it('.. creates a non-inclusive between validator', () => {
        const between5and10 = new RangeValidator({ comparator: '..', min: 5, max: 10 })
        expect(between5and10.validate(7)).toBe(7)
        expect(() => between5and10.validate(10)).toThrow('must be from 5 to less than 10')
    })

    it('- creates a non-inclusive between validator', () => {
        const between50and100 = new RangeValidator({ comparator: '-', min: 50, max: 100 })
        expect(between50and100.validate(75)).toBe(75)
        expect(() => between50and100.validate(100)).toThrow('must be from 50 to less than 100')
    })

    it('... creates an inclusive between validator', () => {
        const between1and10 = new RangeValidator({ comparator: '...', min: 1, max: 10 })

        expect(between1and10.validate(3))
            .toBe(3)

        expect(() => between1and10.validate(11))
            .toThrow('must be from 1 to 10')
    })

})

it('handles an error configuration', () => {
    const belowZero = new RangeValidator({
        value: 0,
        comparator: '<',
        error: 'Must be frozen'
    })

    expect(() => belowZero.validate(0))
        .toThrow('Must be frozen')
})
