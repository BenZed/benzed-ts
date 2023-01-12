import { Callable } from '@benzed/util'

import { Is } from './is'

import { 
    chain, 
    Schema
} from './schema'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const is = new Is() 

//// Tests ////

test('string', () => {
    expect(is.string).toBeInstanceOf(chain.IsString)
})

test('boolean', () => {
    expect(is.boolean).toBeInstanceOf(chain.IsBoolean)
})

test('number', () => {
    expect(is.number).toBeInstanceOf(chain.IsNumber)
})

test('enum()', () => {
    expect(is.enum(-1, 0, 1)).toBeInstanceOf(chain.IsEnum)
    expectTypeOf(is.enum(-1, 0, 1))
        .toEqualTypeOf<chain.IsEnum<[-1,0,1]>>()
})

test('schema.from signature', () => {
    expect(Callable.signatureOf(is)).toEqual(Schema.from)

    expectTypeOf(is(0)).toEqualTypeOf<chain.IsEnum<[0]>>()
})

//// Examples ////

it('string or boolean', () => {

    const isStringBoolOrNumber = is.string.or.boolean.or(is.number)

    expect(isStringBoolOrNumber('10')).toEqual(true)
    expect(isStringBoolOrNumber(10)).toEqual(true)
    expectTypeOf(isStringBoolOrNumber).toMatchTypeOf<chain.IsUnion<[
        chain.IsString, 
        chain.IsBoolean, 
        chain.IsNumber
    ]>>()
})