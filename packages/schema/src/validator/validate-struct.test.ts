import { ValidateStruct, $$disallowed } from './validate-struct'

import { expectTypeOf } from 'expect-type'

//// Types ////

function assert<I>(this: Asserter<I>, i: I): I {
    if (!this.isValid(i))
        throw new Error(`${i} is not valid.`)
    return i
}

class Asserter<I> extends ValidateStruct<I,I> {
    constructor(readonly isValid: (input: I) => boolean) {
        super(assert)
    }
}

class AssertHigher<N extends number> extends Asserter<number> {
    readonly [$$disallowed] = ['isValid'] as const
    constructor(readonly value: N) {
        super(function (this: AssertHigher<N>, input: number): boolean {
            return input > this.value
        })
    }
}

//// Validators ////

const startsWithHashTag = (i: string): boolean => i.startsWith('#')

const $hashtag = new Asserter(startsWithHashTag)

//// Tests ////

it('get validator settings', () => {

    const $hashtagSettings = Asserter.settingsOf($hashtag)

    expect($hashtagSettings).toEqual({ isValid: startsWithHashTag })
    expectTypeOf($hashtagSettings).toEqualTypeOf<{ isValid: typeof startsWithHashTag }>()

    expect($hashtag('#ace')).toEqual('#ace')
    expect(() => $hashtag('ace')).toThrow('ace is not valid')
})

it('apply copies a validator with new settings', () => {

    const $path = Asserter.apply($hashtag, {
        isValid(i) {
            return i.startsWith('/')
        }
    })

    expect($path).not.toBe($hashtag)
    expect($path('/ace')).toEqual('/ace')
    expect(() => $path('#ace')).toThrow('#ace is not valid')
})
 
it('apply ignores invalid settings', () => {

    const $hashTagWithId = Asserter.apply($hashtag, {
        // @ts-expect-error Bad setting  
        unused: 'setting'
    })

    expect($hashTagWithId).not.toHaveProperty('unused')
    expect($hashTagWithId).toHaveProperty('isValid', $hashtag.isValid)
})

it('disallowed keys', () => {

    const $above5 = new AssertHigher(5) 

    expect($above5(6)).toEqual(6)
    expect(() => $above5(5)).toThrow('5 is not valid')

    const $above5Settings = AssertHigher.settingsOf($above5)
    expect($above5Settings).toEqual({ value: 5 })
    expectTypeOf($above5Settings).toEqualTypeOf<{ value: 5 }>()

}) 