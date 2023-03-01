import {
    assign,
    define,
    isBoolean,
    isNumber,
    isShape,
    nil,
    pick
} from '@benzed/util'

import Modifier from '../modifier'
import { Optional } from './optional'
import { testValidator } from '../../../util.test'
import { TypeValidator } from '../../validators'

import { expectTypeOf } from 'expect-type'

import { Trait } from '@benzed/traits'
import { StructStateApply, Structural } from '@benzed/immutable'

//// Setup //// 

class CookieJar extends TypeValidator<{ cookies: number, open: boolean }> {

    isValid = isShape({ 
        cookies: isNumber,
        open: isBoolean
    }) 

    readonly enabled: boolean = true

    toggleEnabled(): this {
        return Structural.create(
            this,
            { enabled: !this.enabled } as StructStateApply<this>
        )
    }

    get [Structural.state](): Pick<this, 'name' | 'message' | 'cast' | 'default' | 'enabled'> {
        return pick(this, 'name', 'message', 'cast', 'default', 'enabled')
    }

    set [Structural.state](state: Pick<this, 'name' | 'message' | 'cast' | 'default' | 'enabled'>) {
        define.named(state.name, this)
        define.hidden(this, 'message', state.message)
        define.hidden(this, 'cast', state.cast)
        define.hidden(this, 'default', state.default)
        define.enumerable(this, 'enabled', state.enabled)
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
        expect(() => new Optional(new Optional($cookieJar))).toThrow('already has modifier')
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
        expect($maybeCookieJar[Modifier.target]).toEqual($cookieJar)

        const $disabledMaybeCookieJar = $maybeCookieJar.toggleEnabled()
        expect($disabledMaybeCookieJar.required).toBeInstanceOf(CookieJar)
        expect($disabledMaybeCookieJar[Modifier.target]).toBeInstanceOf(CookieJar)
    })
 
})

