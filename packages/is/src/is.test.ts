import { Callable } from '@benzed/util'

import { is } from './is'

import { IsBoolean, IsNumber, IsString, IsUnion, Schema } from './schema'

import { expectTypeOf } from 'expect-type'

//// Tests ////

test('string', () => {
    expect(is.string).toBeInstanceOf(IsString)
})

test('boolean', () => {
    expect(is.boolean).toBeInstanceOf(IsBoolean)
})

test('number', () => {
    expect(is.number).toBeInstanceOf(IsNumber)
})

test('schema.from signature', () => {
    expect(Callable.signatureOf(is)).toEqual(Schema.resolve)
    const isZero = is(0)
    expectTypeOf(isZero).toEqualTypeOf<IsValue<0>>()
})

//// Examples ////

it('is.string.or.boolean', () => {

    const isStringBoolOrNumber = is.string.or.boolean.or.number

    expect(isStringBoolOrNumber('10')).toEqual(true)
    expect(isStringBoolOrNumber(10)).toEqual(true)
    expectTypeOf(isStringBoolOrNumber).toMatchTypeOf<IsUnion<[
        IsString, 
        IsBoolean,
        IsNumber
    ]>>()
})
