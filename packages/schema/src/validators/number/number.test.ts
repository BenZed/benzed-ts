
import { Validator } from '../type'
import createNumberValidator from './number'

describe('number validator', () => {

    let weirdNumberValidator: Validator<unknown, number | undefined>
    beforeAll(() => {
        weirdNumberValidator = createNumberValidator({
            required: false,
            cast: true,
            range: ['>', 0],
            round: 1
        })
    })

    it('can be configured to use the cast sanitizer', () => {
        expect(weirdNumberValidator('1')).toBe(1)
    })

    it('can be configured to use the round sanitizer', () => {
        expect(weirdNumberValidator(0.75)).toBe(1)
    })

    it('can be configured with the range validator', () => {
        expect(() => weirdNumberValidator(0)).toThrow('must be above 0')
    })

    it('can be configured to use the required sanitizer', () => {

        const requiredNumberValidator = createNumberValidator({
            required: true
        })

        expect(() => requiredNumberValidator(undefined)).toThrow('is required')
    })
})