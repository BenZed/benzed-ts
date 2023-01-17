
import { copy } from '@benzed/immutable'
import { TypeOf } from '@benzed/util'

import { 
    isString, 
    isNumber, 
    isBoolean, 
    Boolean, 
    String, 
    Number,
} from '../schema/schemas/type'
import { isNaN, NaN, Value } from '../schema/schemas/value'

import { expectTypeOf } from 'expect-type'

import { OrTo } from './or-to'
import { Or } from './or'
//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types,
*/

//// Data ////

const isBooleanOr = new OrTo(isBoolean)
const isBooleanOrString = isBooleanOr.string
const isBooleanOrStringOrNumber = new OrTo(isBoolean)(isString, isNumber)
//// Tests ////

it('chain string or boolean example', () => {  

    expectTypeOf(isBooleanOrString).toMatchTypeOf<Or<[Boolean, String]>>()

    expectTypeOf<TypeOf<typeof isBooleanOrString>>().toEqualTypeOf<boolean | string>()

    expect(isBooleanOrString('ace')).toEqual(true)
    expect(isBooleanOrString.validate('ace')).toEqual('ace')

    expect(isBooleanOrString(true)).toEqual(true)
    expect(isBooleanOrString.validate(true)).toEqual(true)

    expect(isBooleanOrString(10)).toEqual(false)
    expect(() => isBooleanOrString.validate(10))
        .toThrow(Error)

})

it('chain string or boolean or number', () => {
    expectTypeOf(isBooleanOrStringOrNumber)
        .toMatchTypeOf<Or<[Boolean, String, Number]>>()
    
    expectTypeOf<TypeOf<typeof isBooleanOrStringOrNumber>>()
        .toEqualTypeOf<boolean | string | number>()

    for (const value of ['string', true, 10])
        expect(isBooleanOrStringOrNumber(value)).toEqual(true)
})

it('chain method also has Or.to signature', () => {

    const isSortOutput = new OrTo(new Value(0))(new Value(1), new Value(-1))

    expect(isSortOutput(1)).toEqual(true)
    expect(isSortOutput(-1)).toEqual(true)
    expect(isSortOutput(0)).toEqual(true)
    expect(isSortOutput(2)).toEqual(false)
})

describe('flattening', () => {

    it('chained schemas are flattened', () => {
        expect(isBooleanOrStringOrNumber.types).toHaveLength(3)
    })

})

it('types are preserved on copy', () => {
    expect(copy(isBooleanOrString).types).toHaveLength(2)
    expect(copy(isBooleanOrString)).not.toBe(isBooleanOrString)
})

it('isNaN merges nicely', () => { 
    const isStringOrNaN = new OrTo(isNaN).string
    expectTypeOf(isStringOrNaN).toMatchTypeOf<Or<[String, NaN]>>()
})