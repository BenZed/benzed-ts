
import { toTrue } from '@benzed/util'
import {
    CustomValidator, 
    CustomValidatorSettingsShortcut,
    toCustomValidatorSettings 
} from './custom'

/*** Shortcuts ***/

const custom = <I, O extends I = I>(
    ...input: CustomValidatorSettingsShortcut<I,O>
): CustomValidator<I,O> => 
    new CustomValidator(toCustomValidatorSettings(input))

/*** Tests ***/

describe('custom transform-equal validator', () => {

    let isEven: CustomValidator<number>
    beforeAll(() => {
        isEven = custom<number>(i => i - i % 2)
    })
    
    it('creates a custom transform validator', () => {

        expect(isEven.validate(3, true))
            .toEqual(2)

    })

    it('asserts if output is not the same as the transform output', () => {

        expect(() => isEven.validate(3, false))
            .toThrow('Validation failed')

    })

    it('allows custom errors', () => {

        const isLoud = custom<string>(
            i => i.toUpperCase(),
            i => `"${i}" is not LOUD`
        )

        expect(() => isLoud.validate('quiet', false))
            .toThrow('"quiet" is not LOUD')
    })

})

describe('custom transform validator', () => {

    let suspensful: CustomValidator<string> 
    beforeAll(() => {
        suspensful = custom<string>({ 
            transform: i => i.endsWith('...') ? i : i + '...',
            isValid: toTrue, 
        })
    })

    it('transforms only, does not assert', () => {
        expect(suspensful.validate('maybe', true)).toEqual('maybe...')
        expect(suspensful.validate('maybe', false)).toEqual('maybe')
    })

})

describe('custom assert validator', () => {

    let isPiglatin: CustomValidator<string>
    beforeAll(() => {
        isPiglatin = custom<string>({ 
            isValid: i => i.endsWith('ay'), 
            error: 'ustmay ebay iglatinpay'
        })
    })

    it('asserts that the input passes the given is typeguard', () => {

        expect(isPiglatin.validate('akecay', true))
            .toEqual('akecay')

        expect(() => isPiglatin.validate('cake', false))
            .toThrow(isPiglatin.settings.error as string)

    })

})

describe('custom assert-transform validator', () => {

    let isLiquidWater: CustomValidator<number>
    beforeAll(() => {
        isLiquidWater = custom<number>({ 
            transform: i => i < 0 ? 0 : i,
            isValid: i => i >= 0 && i < 100, 
            error: i => `${i}c is not liquid water temperature`
        })
    })

    it('transforms input and asserts that the resultant transformation is correct', () => {

        expect(isLiquidWater.validate(-1, true))
            .toEqual(0)

        expect(() => isLiquidWater.validate(100, true))  
            .toThrow('100c is not liquid water temperature')

        expect(() => isLiquidWater.validate(-10, false))  
            .toThrow('-10c is not liquid water temperature')

    })

})