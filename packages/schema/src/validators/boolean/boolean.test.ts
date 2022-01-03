
import { Validator } from '../type'
import createBooleanValidator from './boolean'

describe('boolean validator', () => {

    let weirdBoolValidator: Validator<unknown, boolean | undefined>
    beforeAll(() => {

        createBooleanValidator({
            required: true,
            cast: true
        })

        weirdBoolValidator = createBooleanValidator({
            required: false,
            cast: true
        })
    })

    it('can be configured to use the cast sanitizer', () => {
        expect(weirdBoolValidator('1')).toBe(true)
    })

    it('Can be configured to use a custom cast saniziter', () => {
        const boolValidatorWithCustomCast = createBooleanValidator({
            required: true,
            cast: input => input === 'yes' ? true : false
        })

        const output = boolValidatorWithCustomCast('yes')
        expect(output).toEqual(true)
    })

    it('can be configured to use the required sanitizer', () => {

        const requiredBoolValidator = createBooleanValidator({
            required: true
        })

        expect(() => requiredBoolValidator(undefined)).toThrow('is required')
    })
})