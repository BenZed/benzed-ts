import { isBoolean, isNumber, isShape, nil } from '@benzed/util'
import { $$state, StructState } from '@benzed/immutable'

import { Optional } from './optional'
import { testValidator } from '../../../util.test'
import { TypeValidator } from '../../validators'

import { expectTypeOf } from 'expect-type'
import { $$target } from '../mutator'

//// Tests ////

class CookieJar extends TypeValidator<{ cookies: number, open: boolean }> {

    isValid = isShape({
        cookies: isNumber,
        open: isBoolean
    })

    readonly enabled = true

    toggleEnabled(): this {

        console.log('TOGGLE', this[$$state])

        return TypeValidator.applyState(
            this, 
            { ...this[$$state], enabled: !this.enabled } as StructState<this>
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

    it.only('result instances retain mutator properties', () => {  

        const $maybeCookieJar2 = Object.create($maybeCookieJar)

        console.log($maybeCookieJar2) 
 
        // expect($maybeCookieJar[$$target]).toEqual($cookieJar)

        // console.log('PRE TOGGLE', $maybeCookieJar)

        // const $disabledMaybeCookieJar = $maybeCookieJar.toggleEnabled() 

        // console.log('POST TOGGLE', $disabledMaybeCookieJar)

        // $maybeCookieJar[$$state] = {}

        // expect($disabledMaybeCookieJar.required).toEqual($cookieJar)
        // expect($disabledMaybeCookieJar[$$target]).toEqual($cookieJar)

    }) 

})

