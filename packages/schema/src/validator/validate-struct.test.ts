import { ValidateAssign, ValidateStruct } from './validate-struct'

import { expectTypeOf } from 'expect-type'
import { omit } from '@benzed/util'

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

class AssertHigher extends Asserter<number> {

    [Asserter.$$assign](input: ValidateAssign<this>): ValidateAssign<this> {
        return omit(input, 'isValid')
    }

    constructor(readonly value: number) {
        super(function (this: AssertHigher, input: number): boolean {
            return input > this.value
        })
    }
}

//// Validators ////

const startsWithHashTag = (i: string): boolean => i.startsWith('#')

const $hashtag = new Asserter(startsWithHashTag)

//// Tests ////

it('get validator settings', () => {
 
    const $hashtagSettings = { ...$hashtag }

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

it('respects assign constraints', () => {

    const $above5 = new AssertHigher(5)

    expect($above5(6)).toEqual(6)
    expect(() => $above5(5)).toThrow('is not valid')

    const $above4 = Asserter.apply($above5, { value: 4, isValid: () => true })

    expect($above4.isValid).toEqual($above5.isValid)
    expect($above4(5)).toEqual(5)
    expect(() => $above4(4)).toThrow('is not valid')

})