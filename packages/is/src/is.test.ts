import { Callable } from '@benzed/util'

import { Is } from './is'

import { 
    Schema,
    IsBoolean, 
    IsEnum, 
    IsNumber, 
    IsString,
    IsUnion
} from './schema'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const is = new Is() 

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

test('enum()', () => {
    expect(is.enum(-1, 0, 1)).toBeInstanceOf(IsEnum)
    expectTypeOf(is.enum(-1, 0, 1)).toEqualTypeOf<IsEnum<[-1,0,1]>>()
})

test('schema.from signature', () => {
    expect(Callable.signatureOf(is)).toEqual(Schema.from)

    expectTypeOf(is(0)).toEqualTypeOf<IsEnum<[0]>>()
})

//// Examples ////

it('string or boolean', () => {

    const isStringBoolOrNumber = is.string.or.boolean.or(is.number)

    expect(isStringBoolOrNumber('10')).toEqual(true)
    expect(isStringBoolOrNumber(10)).toEqual(true)
    expectTypeOf(isStringBoolOrNumber).toMatchTypeOf<IsUnion<[IsString, IsBoolean, IsNumber]>>()
})