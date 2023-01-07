import IsBoolean from './boolean'
import { Or, IsUnion } from './or'

import { expectTypeOf } from 'expect-type'
import IsNumber from './number'
import IsEnum from './enum'
import { IsString } from './string'
import { isString, TypeOf } from '@benzed/util'

const $booleanOr = new Or(new IsBoolean())
const isBooleanOrString = $booleanOr.string
const isBooleanOrStringOrNumber = isBooleanOrString.or.number

it('chain string or boolean example', () => {

    expectTypeOf(isBooleanOrString).toMatchTypeOf<IsUnion<[IsBoolean, IsString]>>()

    expectTypeOf<TypeOf<typeof isBooleanOrString>>().toEqualTypeOf<boolean | string>()

    expect(isBooleanOrString('ace')).toEqual(true)
    expect(isBooleanOrString.validate('ace')).toEqual('ace')

    expect(isBooleanOrString(true)).toEqual(true)
    expect(isBooleanOrString.validate(true)).toEqual(true)

    expect(isBooleanOrString(10)).toEqual(false)
    expect(() => isBooleanOrString.validate(10))
        .toThrow('Must be type boolean,Must be type string')

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

it('chain method also has schema.from signature', () => {

    const zeroOr = new Or(new IsEnum(0))

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

    it('validators are preserved', () => {

        const isTruthyStringOrBool = new Or(new IsString)
            .boolean
            .asserts(i => !!i, i => isString(i) ? 'Must not be empty' : 'Must not be false')

        expect(isTruthyStringOrBool(false)).toBe(false)
        expect(isTruthyStringOrBool('')).toBe(false)
        expect(isTruthyStringOrBool('')).toBe(false)
        expect(isTruthyStringOrBool('hey')).toBe(true)
        expect(isTruthyStringOrBool(true)).toBe(true)

        expect(() => isTruthyStringOrBool.validate('')).toThrow('Must not be empty')
        expect(() => isTruthyStringOrBool.validate(false)).toThrow('Must not be false')
    })

})