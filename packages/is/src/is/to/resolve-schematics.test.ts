import { resolveSchematic } from './resolve-schematics'

import { test, expect } from '@jest/globals'

import { Instance, isString, Value } from '../../schema'

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
