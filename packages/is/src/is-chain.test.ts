
import { isString } from '@benzed/util'
import { test } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

import { IS, Is, Or, Str, Bool } from './is-chain'

//// Tests ////

const is = (() => void 0) as unknown as IS
const string = isString as Str

test.skip('is(string)', () => {
    const isStr = is(string)
    expectTypeOf(isStr).toEqualTypeOf<Is<Str>>()
})

test.skip('is.string', () => {
    const isStr = is.string
    expectTypeOf(isStr).toEqualTypeOf<Is<Str>>()

    // Inherits getters
    const isTrimStr = is.string.trim
    expectTypeOf(isTrimStr).toEqualTypeOf<Is<Str>>()

    // Inherits methods
    const isChar = is.string.length('==', 1)
    expectTypeOf(isChar).toEqualTypeOf<Is<Str>>()
})

test.skip('is.boolean.or.string', () => {
    const isStrOrBool = is.boolean.or.string
    expectTypeOf(isStrOrBool).toEqualTypeOf<Is<Or<[Bool, Str]>>>()

    // Inherits last getters
    const isBoolOrTrimString = is.boolean.or.string.trim
    expectTypeOf(isBoolOrTrimString).toEqualTypeOf<Is<Or<[Bool, Str]>>>()

    // Inherits last method
    const isStringOrNegativeNumber = is.string.or.number.range('<', 0)
    expectTypeOf(isStringOrNegativeNumber).toEqualTypeOf<Is<Or<[Bool, Str]>>>()

})

test.skip('is(is.string.or.boolean).or(is.string.or.number)', () => {

    const isSingleCharOrDoubleCharOrNegativeNumber = is
        .string.length('==', 1)
        .or.string.length('==', 2)
        .or.number.range('<', 0)

    expectTypeOf(isSingleCharOrDoubleCharOrNegativeNumber).toEqualTypeOf<Is<Or<[Str, Bool]>>>()

})
