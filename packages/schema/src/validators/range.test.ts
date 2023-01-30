import { RangeValidator } from './range'

describe('unary comparators', () => {   
  
    it('== creates an equal-to validator', () => {
        const equalTo10 = new RangeValidator<bigint>('==', 10n)

        expect(equalTo10(10n)).toBe(10n)
        expect(() => equalTo10(9n)).toThrow('Must be equal 10')
    })

    it('<= creates a less-than-or-equal-to validator', () => { 
        const lessThanOrEqualTo5 = new RangeValidator<number>({ comparator: '<=', value: 5 })
        expect(lessThanOrEqualTo5(4)).toBe(4)
        expect(() => lessThanOrEqualTo5(6)).toThrow('Must be equal or below 5')
    })    

    it('< creates a less-than validator', () => {
        const lessThanBase = new RangeValidator<string>({ comparator: '<', value: 'base' })
        expect(lessThanBase('ace')).toBe('ace')
        expect(() => lessThanBase('case')).toThrow('Must be below base')
    })

    it('> creates a more-than validator', () => {
        const moreThan25 = new RangeValidator<number>({ comparator: '>', value: 25 })
        expect(moreThan25(42)).toBe(42)
        expect(() => moreThan25(24)).toThrow('Must be above 25')
    }) 

    it('>= creates a more-than validator', () => {
        const moreThanOrEqual10 = new RangeValidator<number>({ comparator: '>=', value: 10 })
        expect(moreThanOrEqual10(42)).toBe(42)
        expect(() => moreThanOrEqual10(8)).toThrow('Must be equal or above 10')
    })

})

describe('binary comparators', () => {

    it('.. creates a non-inclusive between validator', () => {
        const between5and10 = new RangeValidator<number>({ comparator: '..', min: 5, max: 10 })
        expect(between5and10(7)).toBe(7)
        expect(() => between5and10(10)).toThrow('Must be equal or above 5 and below 10')
    })

    it('... creates an inclusive between validator', () => {
        const between1and10 = new RangeValidator<number>({ comparator: '...', min: 1, max: 10 })

        expect(between1and10(3))
            .toBe(3)
        expect(between1and10(10)).toEqual(10)
        expect(() => between1and10(11))
            .toThrow('ust be equal or above 1 and below or equal 10')
    })
})

it('handles an error configuration', () => {

    const belowZero = new RangeValidator<number>({
        value: 0,
        comparator: '<',
        error: 'Must be frozen'
    })

    expect(() => belowZero(0))
        .toThrow('Must be frozen')
})
