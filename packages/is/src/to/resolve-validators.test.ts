
import { test, expect } from '@jest/globals'

import { $string, Instance, Value } from '../schemas'

import { resolveValidator } from './resolve-validators'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Setup ////

class Foo {}

//// Tests ////
  
describe('resolveValidator', () => {

    test('schematic from primitive', () => {
        const $zero = resolveValidator(0)
        expect($zero).toBeInstanceOf(Value)
        expect($zero.value).toBe(0)
        expect($zero(0)).toBe(0) 
    })

    test('schematic from instance', () => {
    
        const $foo = resolveValidator(Foo)
        expect($foo).toBeInstanceOf(Instance)
        expect($foo(new Foo)).toEqual(new Foo)
    })

    test('schematic fall through', () => {
        const $string2 = resolveValidator($string)
        expect($string2).toBe($string)
    }) 

})
