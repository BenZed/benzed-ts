import { RangeValidator } from './range'

describe('unary comparators', () => {

    it('== creates an equal-to validator', () => {  
        const equalTo10 = new RangeValidator('==', 10)

        expect(equalTo10(10)).toBe(10)
        expect(() => equalTo10(9)).toThrow('Must be equal 10')
    })

    it('<= creates a less-than-or-equal-to validator', () => { 
        const lessThanOrEqualTo5 = new RangeValidator({ comparator: '<=', value: 5 })
        expect(lessThanOrEqualTo5(4)).toBe(4)
        expect(() => lessThanOrEqualTo5(6)).toThrow('Must be equal or below 5')
    })

    it('< creates a less-than validator', () => {
        const lessThan50 = new RangeValidator({ comparator: '<', value: 50 })
        expect(lessThan50(42)).toBe(42)
        expect(() => lessThan50(50)).toThrow('Must be below 50')
    })

    it('> creates a more-than validator', () => {
        const moreThan25 = new RangeValidator({ comparator: '>', value: 25 })
        expect(moreThan25(42)).toBe(42)
        expect(() => moreThan25(24)).toThrow('Must be above 25')
    })

    it('>= creates a more-than validator', () => {
        const moreThanOrEqual10 = new RangeValidator({ comparator: '>=', value: 10 })
        expect(moreThanOrEqual10(42)).toBe(42)
        expect(() => moreThanOrEqual10(8)).toThrow('Must be above or equal 10')
    })

})

describe('binary comparators', () => {

    it('.. creates a non-inclusive between validator', () => {
        const between5and10 = new RangeValidator({ comparator: '..', min: 5, max: 10 })
        expect(between5and10(7)).toBe(7)
        expect(() => between5and10(10)).toThrow('Must be between 5 and 10')
    })

    it('... creates an inclusive between validator', () => {
        const between1and10 = new RangeValidator({ comparator: '...', min: 1, max: 10 })

        expect(between1and10(3))
            .toBe(3)

        expect(between1and10(10)).toEqual(10)

        expect(() => between1and10(11))
            .toThrow('Must be from 1 to 10')
    })

})

it('handles an error configuration', () => {

    const belowZero = new RangeValidator({
        value: 0,
        comparator: '<',
        error: 'Must be frozen'
    })

    expect(() => belowZero(0))
        .toThrow('Must be frozen')
})
