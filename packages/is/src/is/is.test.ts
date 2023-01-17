import { Array, isArray, isString, String, isBoolean, Boolean, isNumber, Number } from '../schema'
import { Is } from './is'
import { Or } from './or'
import { Optional } from './optional'
import { ReadOnly } from './readonly'

import { nil } from '@benzed/util'

import { expectTypeOf } from 'expect-type'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Setup //// 

const isStringRef = new Is(isString) 
 
//// Tests ////

it('inherits other schematics methods', () => {
    expect(isStringRef('')).toBe(true)
    expect(isStringRef(0)).toBe(false)
    expect(isStringRef.startsWith).toBeInstanceOf(Function)
})

it('cannot self ref', () => {
    expect(() => new Is(isStringRef)).toThrow('cannot reference an instance of itself')
})

it('schematic methods that return a schematic are re-wrapped in Is', () => {
    const isHash = isStringRef.startsWith('#')
    expect(isHash('#hello')).toBe(true)
    expect(isHash).toBeInstanceOf(Is)
    expect(isHash.ref).toBeInstanceOf(String) 
})

it('schematic getters that return a schematic are re-wrapped in Is', () => {
    const isTrimmed = isStringRef.trim
    expect(isTrimmed(' a ')).toBe(false)
    expect(isTrimmed.validate(' a ')).toBe('a')
    expect(isTrimmed).toBeInstanceOf(Is)
    expect(isTrimmed.ref).toBeInstanceOf(String) 
})

it('wrapping or ref type', () => {
    const isBooleanOrNumber = new Is(new Or(isBoolean, isNumber))
    expectTypeOf(isBooleanOrNumber).toMatchTypeOf<Is<Or<[Boolean, Number]>>>()
    expect(isBooleanOrNumber.types[0]).toBe(isBoolean)
    expect(isBooleanOrNumber.types[1]).toBe(isNumber)    
    expect(isBooleanOrNumber.range).toBeInstanceOf(Function)
})

it('to optional and back', () => {

    const isOptionalString = isStringRef.optional

    expectTypeOf(isOptionalString).toMatchTypeOf<Is<Optional<String>>>()
    expect(isOptionalString).toBeInstanceOf(Is)
    expect(isOptionalString.ref).toBeInstanceOf(Optional)
    expect(isOptionalString('')).toBe(true)
    expect(isOptionalString(nil)).toBe(true)

    const backToString = isOptionalString.required
    expect(backToString.ref).toBe(isStringRef.ref)
    expect(backToString).toBeInstanceOf(Is)
})

it('to readonly and back', () => {
    const isReadonlyArray = new Is(isArray).readonly

    expectTypeOf(isReadonlyArray).toMatchTypeOf<Is<ReadOnly<Array>>>()
    expect(isReadonlyArray).toBeInstanceOf(Is)
    expect(isReadonlyArray.ref).toBeInstanceOf(Optional)
    expect(isReadonlyArray('')).toBe(true)
    expect(isReadonlyArray(nil)).toBe(true)

    const backToArray = isReadonlyArray.writable
    expect(backToArray.ref).toBe(isStringRef.ref)
    expect(backToArray).toBeInstanceOf(Is)
})