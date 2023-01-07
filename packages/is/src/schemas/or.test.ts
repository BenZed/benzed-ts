import IsBoolean from './boolean'
import { Or, IsUnion } from './or'

import { expectTypeOf } from 'expect-type'
import IsNumber from './number'
import IsEnum from './enum'

const $booleanOr = new Or(new IsBoolean())
const isBooleanOrString = $booleanOr.string
const isBooleanOrStringOrNumber = isBooleanOrString.or.number

it('chain string or boolean example', () => {

    expectTypeOf(isBooleanOrString).toMatchTypeOf<IsUnion<[boolean, string]>>()

    expect(isBooleanOrString('ace')).toEqual(true)
    expect(isBooleanOrString.validate('ace')).toEqual('ace')

    expect(isBooleanOrString(true)).toEqual(true)
    expect(isBooleanOrString.validate(true)).toEqual(true)

    expect(isBooleanOrString(10)).toEqual(false)
    expect(() => isBooleanOrString.validate(10))
        .toThrow('Must be type boolean,Must be type string')

})

it('chain string or boolean or number', () => {
    expectTypeOf(isBooleanOrStringOrNumber).toMatchTypeOf<IsUnion<[boolean, string, number]>>()

    for (const value of ['string', true, 10])
        expect(isBooleanOrStringOrNumber(value)).toEqual(true)
})

it('chained schemas are flattened', () => {
    expect(isBooleanOrStringOrNumber.types).toHaveLength(3)
})

it('chain to arbitrary schema', () => {
    
    const isBoolOrStringOrNumberCalled = isBooleanOrString.or(new IsNumber())

    expectTypeOf(isBoolOrStringOrNumberCalled).toEqualTypeOf(isBooleanOrStringOrNumber)
})

it('chain method also has schema.from signature', () => {

    const zeroOr = new Or(new IsEnum(0))

    const isSortOutput = zeroOr(1).or(-1) 
    expectTypeOf(isSortOutput).toMatchTypeOf<IsUnion<[0, 1, -1]>>()

    expect(isSortOutput(1)).toEqual(true)
    expect(isSortOutput(-1)).toEqual(true)
    expect(isSortOutput(0)).toEqual(true)

    expect(isSortOutput(2)).toEqual(false)
})