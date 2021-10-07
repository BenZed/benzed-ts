
import createRoundSanitizer from './round'

describe('round sanitizer', () => {

    it('creates a method that rounds numeric input', () => {

        const rounder = createRoundSanitizer({
            round: true
        })

        expect(rounder(1.5)).toBe(2)
        expect(rounder(2.25)).toBe(2)
    })

    it('handles 0 precision', () => {

        const rounder = createRoundSanitizer({
            round: 0
        })

        expect(rounder(1.5)).toBe(1.5)
        expect(rounder(2.25)).toBe(2.25)
    })

    it('can be configured to floor instead of round', () => {

        const floor = createRoundSanitizer({
            floor: true
        })

        expect(floor(1.5)).toBe(1)
    })

    it('can be configured to ceil instead of round', () => {

        const ceil = createRoundSanitizer({
            ceil: true
        })

        expect(ceil(1.5)).toBe(2)
    })

    it('only one round type can be configured at once', () => {
        // @ts-expect-error Only 'floor' or 'ceil' or 'round' should be declared.
        expect(() => createRoundSanitizer({ floor: true, ceil: 10, round: 10 }))
            .toThrow('Only one rounding algorithm')
    })

    it('returns null if rounder key not supplied', () => {
        expect(createRoundSanitizer({})).toBe(null)
    })

})