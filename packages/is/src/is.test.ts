import { Callable } from '@benzed/util'

import { is } from './is'

import { Schema } from './schema'
import * as chain from './schema/schemas/chain'

import { expectTypeOf } from 'expect-type'

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

test('schema.from signature', () => {
    expect(Callable.signatureOf(is)).toEqual(Schema.resolve)
    const isZero = is(0)
    expectTypeOf(isZero).toEqualTypeOf<chain.IsValue<0>>()
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