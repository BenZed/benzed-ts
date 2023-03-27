import { it, test, expect } from '@jest/globals'

import { resolveValidator } from './resolve-validator'
import { 
    Value, 
    Boolean, 
    String, 
    Shape, 
    Number, 
    $number, 
    InstanceOf
} from '../schemas'

import { expectTypeOf } from 'expect-type'

import { nil } from '@benzed/util'
import { Or, ReadOnly } from '@benzed/schema'

import { is } from '../index'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Setup ////

class Foo {}

//// Tests ////

test('creates values', () => {

    const $five = resolveValidator(5)

    expect($five(5)).toEqual(5)
    expect(() => $five(nil)).toThrow('must be 5')
    expect($five.force()(nil)).toEqual(5)

    expectTypeOf($five).toEqualTypeOf<Value<5>>()

})

test('creates instances', () => {

    const $foo = resolveValidator(Foo)
    expect($foo(new Foo)).toEqual(new Foo)
    expect(() => $foo(nil)).toThrow('must be Foo')

    expectTypeOf($foo).toEqualTypeOf<InstanceOf<Foo>>()

})

test('creates unions', () => {

    const $1or2or3 = resolveValidator(1, 2, 3)
    expect($1or2or3(1)).toEqual(1)
    expect($1or2or3(2)).toEqual(2)
    expect($1or2or3(3)).toEqual(3)

    expectTypeOf($1or2or3).toEqualTypeOf<Or<[Value<1>, Value<2>, Value<3>]>>()

})

test('flattens unions', () => {

    const $1or2 = resolveValidator(1,2)
    const $3or4 = resolveValidator(3,4)
    const $1to4 = resolveValidator($1or2, $3or4)

    expect($1to4.validators).toHaveLength(4) 
})

test('flattens nested unions', () => {

    const $1to3 = new Or(new Value(1), new Or(new Value(2), new Value(3)))

    const $1to4 = resolveValidator($1to3, 4)
    expect($1to4.validators).toHaveLength(4)

})

test('creates shapes', () => {

    const $vector = resolveValidator({
        x: $number,
        y: $number
    })

    expect($vector({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 })

    expectTypeOf($vector).toEqualTypeOf<Shape<{
        x: Number
        y: Number
    }>>()

})

test('recursive shapes', () => {

    class City {
        constructor(readonly name: string) {}
    }

    const $address = resolveValidator({
        type: 'address' as const,
        postal: is.string,
        city: City,
        priority: $number
    })

    expect(
        $address({
            type: 'address',
            postal: '12345',
            city: new City('vancouver'),
            priority: 5
        })
    ).toEqual({
        type: 'address',
        postal: '12345',
        city: new City('vancouver'),
        priority: 5
    })

    expectTypeOf($address).toEqualTypeOf<Shape<{
        type: Value<'address'>
        postal: String
        city: InstanceOf<City>
        priority: Number
    }>>()

})

it('unwraps is', () => {

    const $stringOrBool = resolveValidator(is.string, is.boolean)

    expect($stringOrBool('ace')).toEqual('ace')
    expect($stringOrBool(true)).toEqual(true)

    expectTypeOf($stringOrBool).toEqualTypeOf<Or<[String, Boolean]>>()

})