import { Callable } from '@benzed/util'
import { Is } from './is'
import { Schema } from './schema'
import { 
    BooleanSchema, 
    EnumSchema, 
    NumberSchema, 
    StringSchema,
    OrSchema
} from './schemas'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const is = new Is() 

//// Tests ////

test('schema.from siganture', () => {
    expect(Callable.signatureOf(is)).toEqual(Schema.from)
})

test('string', () => {
    expect(is.string).toBeInstanceOf(StringSchema)
})

test('boolean', () => {
    expect(is.boolean).toBeInstanceOf(BooleanSchema)
})

test('number', () => {
    expect(is.number).toBeInstanceOf(NumberSchema)
})

test('enum()', () => {
    expect(is.enum(-1, 0, 1)).toBeInstanceOf(EnumSchema)
    expectTypeOf(is.enum(-1, 0, 1)).toEqualTypeOf<EnumSchema<[-1,0,1]>>()
})

//// Examples ////

it('string or boolean', () => {

    const isStringBoolOrNumber = is.string.or.boolean.or(is.number)

    expect(isStringBoolOrNumber('10')).toEqual(true)
    expect(isStringBoolOrNumber(10)).toEqual(true)
    expectTypeOf(isStringBoolOrNumber).toMatchTypeOf<OrSchema<[string, boolean, number]>>()
})