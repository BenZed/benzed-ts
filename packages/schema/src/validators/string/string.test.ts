
import { Validator } from '../type'
import createStringValidator from './string'

describe('string validator', () => {

    let weirdStringValidator: Validator<string | unknown, string>
    beforeAll(() => {
        weirdStringValidator = createStringValidator({
            required: true,
            casing: 'upper',
            format: [/\d$/, 'must end with a number'], // ends-with-digit,
            length: 5,
            trim: true,
            cast: true
        }) as Validator<string | unknown, string>
    })

    it('can be configured with cast sanitizer', () => {
        expect(weirdStringValidator(69420)).toBe('69420')
    })

    it('can be configured with case sanitizer', () => {
        expect(weirdStringValidator('heyo5')).toBe('HEYO5')
    })

    it('can be configured with trim sanitizer', () => {
        expect(weirdStringValidator('  12345  ')).toBe('12345')
    })

    it('can be configured with format validator', () => {
        expect(() => weirdStringValidator('what?')).toThrow('must end with a number')
        expect(weirdStringValidator('f1250')).toBe('F1250')
    })

    it('can be configured with required validator', () => {
        expect(() => weirdStringValidator(undefined)).toThrow('is required')
    })

})