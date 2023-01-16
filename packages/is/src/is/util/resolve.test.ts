import { resolveSchematic, resolveSchematics } from './resolve'

import { test, expect } from '@jest/globals'

import { Instance, Boolean, isBoolean, isString, Value } from '../../schema'
import { Or } from '../or'

import { expectTypeOf } from 'expect-type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Setup ////

class Foo {}

//// Tests ////
  
describe('resolveSchematic', () => {

    test('schematic from primitive', () => {
        const isZero = resolveSchematic(0)
        expect(isZero).toBeInstanceOf(Value)
        expect(isZero.value).toBe(0)
        expect(isZero(0)).toBe(true) 
        expect(isZero(1)).toBe(false)
    })

    test('schematic from instance', () => {
    
        const isFoo = resolveSchematic(Foo)
        expect(isFoo).toBeInstanceOf(Instance)
        expect(isFoo(null)).toBe(false)
        expect(isFoo({})).toBe(false)
        expect(isFoo.name).toBe('isInstanceOfFoo')
    })

    test('schematic fall through', () => {
        const isStr = resolveSchematic(isString)
        expect(isStr).toEqual(isString)
    }) 

})

describe('resolveSchematics', () => {

    test('multiple inputs resusult in an Or union', () => {

        const isZeroBoolOrFoo = resolveSchematics(isBoolean, Foo, 0)
        expect(isZeroBoolOrFoo).toBeInstanceOf(Or)
        expect(isZeroBoolOrFoo(0)).toBe(true)
        expect(isZeroBoolOrFoo(true)).toBe(true)
        expect(isZeroBoolOrFoo(new Foo())).toBe(true)
        expect(isZeroBoolOrFoo(2)).toBe(false)

        expectTypeOf(isZeroBoolOrFoo)
            .toEqualTypeOf<Or<[Boolean, Instance<typeof Foo>, Value<0>]>>()
    })

    test.todo('unions are flattened')

    test.todo('multiple equal values are merged')

})