import { 
    isBoolean, 
    isNumber, 
    isShape, 
    nil 
} from '@benzed/util'

import { Optional } from './optional'
import { testValidator } from '../../../util.test'
import { TypeValidator } from '../../validators'

import { $$target } from '../mutator'

import { expectTypeOf } from 'expect-type'
import { ValidatorUpdateSettings } from '../../validate-struct'

//// Setup ////

class CookieJar extends TypeValidator<{ cookies: number, open: boolean }> {

    isValid = isShape({
        cookies: isNumber,
        open: isBoolean
    })

    readonly enabled = true

    toggleEnabled(): this {
        return TypeValidator.applySettings( 
            this, 
            { enabled: !this.enabled } as unknown as ValidatorUpdateSettings<this>
        )
    }
}

const $cookieJar = new CookieJar

const $maybeCookieJar = new Optional($cookieJar)

//// Tests ////

describe('Optional validation mutation', () => {

    expectTypeOf($maybeCookieJar)
        .toEqualTypeOf<Optional<CookieJar>>()

    testValidator<unknown, { cookies: number, open: boolean }>(
        $cookieJar,
        { asserts: nil, error: true }
    )
    
    testValidator<unknown, { cookies: number, open: boolean } | undefined>(
        $maybeCookieJar,
        { asserts: nil },
    )

})

describe('removable', () => {

    testValidator<unknown, { cookies: number, open: boolean }>(
        $maybeCookieJar.required,
        { asserts: nil, error: true }
    )
 
})

describe('effect on target', () => { 

    it('cannot be stacked', () => {
        expect(() => new Optional(new Optional($cookieJar))).toThrow('already has mutator')
    })

    it('has target properties', () => {
        expect($maybeCookieJar.cast).toBe($cookieJar.cast)
        expect($maybeCookieJar.default).toBe($cookieJar.default)
        expect($maybeCookieJar.enabled).toBe($cookieJar.enabled)
    })
  
    it('favours own properties', () => {
        expect($maybeCookieJar.required).toEqual($cookieJar)
        expect($maybeCookieJar.required).toBeInstanceOf(CookieJar)
    })

    it('wraps result instances in self', () => {  

        const $disabledCookieJar = $cookieJar.toggleEnabled()
        expect($disabledCookieJar).toBeInstanceOf(CookieJar)
        const $disabledMaybeCookieJar = $maybeCookieJar.toggleEnabled()  

        expect($disabledMaybeCookieJar.enabled).toEqual(false) 
        expect($disabledMaybeCookieJar).toBeInstanceOf(Optional)

        expectTypeOf($disabledMaybeCookieJar)
            .toEqualTypeOf<Optional<CookieJar>>()  
    })

    it('result instances retain mutator properties', () => {  
 
        expect($maybeCookieJar[$$target]).toEqual($cookieJar)

        const $disabledMaybeCookieJar = $maybeCookieJar.toggleEnabled()

        expect($disabledMaybeCookieJar.required).toBeInstanceOf(CookieJar)
        expect($disabledMaybeCookieJar[$$target]).toBeInstanceOf(CookieJar)
    })
})

