import { Or } from './or'
import IsUnion from './is-union'
import { IsString, IsBoolean, IsNumber } from '../is-type'

import { expectTypeOf } from 'expect-type'

import { copy } from '@benzed/immutable'
import { isString, TypeOf } from '@benzed/util'
import { isNaN, IsValue } from '../is-value'

//// Data ////

const isBooleanOr = new Or(new IsBoolean())
const isBooleanOrString = isBooleanOr.string
const isBooleanOrStringOrNumber = isBooleanOrString.or.number

//// Tests ////

it('type debugging', () => {

    const t2 = isBooleanOr(new IsString)

})

it('chain string or boolean example', () => {  

    expectTypeOf(isBooleanOrString).toMatchTypeOf<IsUnion<[IsBoolean, IsString]>>()

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
        .toMatchTypeOf<IsUnion<[IsBoolean, IsString, IsNumber]>>()
    
    expectTypeOf<TypeOf<typeof isBooleanOrStringOrNumber>>()
        .toEqualTypeOf<boolean | string | number>()

    for (const value of ['string', true, 10])
        expect(isBooleanOrStringOrNumber(value)).toEqual(true)
})

it('chain to arbitrary schema', () => {
    const isBoolOrStringOrNumberCalled = isBooleanOrString.or(new IsNumber())

    expectTypeOf(isBoolOrStringOrNumberCalled).toEqualTypeOf(isBooleanOrStringOrNumber)
    expectTypeOf<TypeOf<typeof isBooleanOrStringOrNumber>>() 
        .toEqualTypeOf<boolean | string | number>()
})

it('chain method also has Or.to signature', () => {

    const zeroOr = new Or(new IsValue(0))

    const isSortOutput = zeroOr(1).or(-1)

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
    const isStringOrNaN = new Or(isNaN).string

    expectTypeOf(isStringOrNaN).toEqualTypeOf<IsUnion<[]>>()
})