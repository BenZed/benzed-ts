import { isBoolean, isNumber, isShape, nil } from '@benzed/util'
import { StructState } from '@benzed/immutable'

import { Optional } from './optional'
import { testValidator } from '../../../util.test'
import { TypeValidator } from '../../validators'

import { expectTypeOf } from 'expect-type'

//// Tests ////

class CookieJar extends TypeValidator<{ cookies: number, open: boolean }> {

    isValid = isShape({
        cookies: isNumber,
        open: isBoolean
    })

    readonly enabled = true

    toggleEnabled(): this {

        console.log(this)
        return TypeValidator.applyState(
            this, 
            { enabled: !this.enabled } as StructState<this>
        )
    }
}

const $cookieJar = new CookieJar

const $maybeCookieJar = new Optional($cookieJar)

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

    it('has target properties', () => {
        expect($maybeCookieJar.cast).toBe($cookieJar.cast)
        expect($maybeCookieJar.default).toBe($cookieJar.default)
        expect($maybeCookieJar.enabled).toBe($cookieJar.enabled)
    })

    it('favours own properties', () => {
        expect($maybeCookieJar.required).toEqual($cookieJar)
    })

    it('wraps build method resuilts in Optional', () => { 

        const $disabledCookieJar = $cookieJar.toggleEnabled()

        const $disabledMaybeCookieJar = $maybeCookieJar.toggleEnabled()

        expect($disabledMaybeCookieJar.enabled).toBeInstanceOf(false)
        expect($disabledMaybeCookieJar).toBeInstanceOf(Optional)

        expectTypeOf($disabledMaybeCookieJar)
            .toEqualTypeOf<Optional<CookieJar>>()

    })

})

