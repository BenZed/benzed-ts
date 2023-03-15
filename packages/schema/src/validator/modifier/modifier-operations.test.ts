
import { describe, it, expect } from '@jest/globals'
import { isArrayOf, isString as isString } from '@benzed/util'
import { expectTypeOf } from 'expect-type'

import {
    AddModifier,
    RemoveModifier, 
    HasModifier,
    addModifiers,
    removeModifier, 
    hasModifier,
    ensureModifier,
    modifiersOf,
    isModifier,
    ModifierType
} from './modifier-operations'

import { Optional, ReadOnly } from './modifiers'
import { Modifier } from './modifier'

import { ContractValidator } from '../validators'
import { Validator } from '../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Setup ////

interface To<O> extends Validator<unknown, O> {}

interface String extends To<string> {}
const $string: String = new class extends ContractValidator<unknown, string> {

    override message() {
        return 'Must be a String'
    }

    override isValid = isString

}

interface ArrayOfString extends To<string[]> {}
const $arrayOfString: ArrayOfString = new class extends ContractValidator<unknown, string[]> {

    override message() {
        return 'Must be an array of string'
    }

    override isValid = isArrayOf(isString)

}

//// Tests ////

describe('AddModifier', () => {
 
    it('Optional', () => {
        type OptionalString = AddModifier<String, ModifierType.Optional>
        expectTypeOf<OptionalString>().toEqualTypeOf<Optional<String>>()

        // Doesn't nest
        for (const $optionalString of [
            addModifiers($string, ModifierType.Optional), 
            addModifiers($string, ModifierType.Optional, ModifierType.Optional) 
        ]) {

            expect($optionalString).toBeInstanceOf(Optional)
            expect($optionalString[Modifier.target]).toBe($string) 
            expectTypeOf($optionalString).toEqualTypeOf<Optional<String>>()
        }

    })

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = AddModifier<ArrayOfString, ModifierType.ReadOnly>
        expectTypeOf<ReadonlyArrayOfString>().toEqualTypeOf<ReadOnly<ArrayOfString>>()

        // Doesn't nest
        for (const $readonlyArrayOfString of [
            addModifiers($arrayOfString, ModifierType.ReadOnly), 
            addModifiers($arrayOfString, ModifierType.ReadOnly, ModifierType.ReadOnly)
        ]) {
            expectTypeOf($readonlyArrayOfString).toEqualTypeOf<ReadOnly<ArrayOfString>>()
            expect($readonlyArrayOfString).toBeInstanceOf(ReadOnly)
            expect($readonlyArrayOfString[Modifier.target]).toBe($arrayOfString) 
        }
    })

})

describe('RemoveModifier', () => {

    it('Optional', () => {
        type OptionalString = Optional<String>
        type String1 = RemoveModifier<OptionalString, ModifierType.Optional>

        const $optionalString = new Optional($string)
        const $string1 = removeModifier($optionalString, ModifierType.Optional)
        expect($string1).toBe($string)
        expectTypeOf<String1>().toEqualTypeOf($string1)
    })

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = ReadOnly<ArrayOfString>
        type ArrayOfString1 = RemoveModifier<ReadonlyArrayOfString, ModifierType.ReadOnly>

        const $readonlyArrayOfString = new ReadOnly($arrayOfString)
        const $arrayOfString1 = removeModifier($readonlyArrayOfString, ModifierType.ReadOnly)
        expectTypeOf<ArrayOfString1>().toEqualTypeOf($arrayOfString1)
    })

})

describe('HasModifier', () => {

    it('Optional', () => {
        type OptionalString = Optional<String>
        const $optionalString = new Optional($string)

        type IsOptional = HasModifier<OptionalString, ModifierType.Optional>
        expectTypeOf<IsOptional>().toEqualTypeOf<true>()
        expect(hasModifier($optionalString, ModifierType.Optional)).toBe(true)

        type IsReadonly = HasModifier<OptionalString, ModifierType.ReadOnly>
        expectTypeOf<IsReadonly>().toEqualTypeOf<false>()

    })

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = ReadOnly<ArrayOfString>
        const $readOnlyArrayOfString = new ReadOnly($arrayOfString)

        type IsOptional = HasModifier<ReadonlyArrayOfString, ModifierType.Optional>
        expectTypeOf<IsOptional>().toEqualTypeOf<false>()
        expect(hasModifier($readOnlyArrayOfString, ModifierType.Optional)).toBe(false)

        type IsReadonly = HasModifier<ReadonlyArrayOfString, ModifierType.ReadOnly>
        expectTypeOf<IsReadonly>().toEqualTypeOf<true>()
        expect(hasModifier($readOnlyArrayOfString, ModifierType.ReadOnly)).toBe(true)
    })

    it('OptionalReadOnly', () => {

        type OptionalReadOnlyArrayOfString = Optional<ReadOnly<ArrayOfString>>

        type IsOptional = HasModifier<OptionalReadOnlyArrayOfString, ModifierType.Optional>
        type IsReadOnly = HasModifier<OptionalReadOnlyArrayOfString, ModifierType.ReadOnly>
        expectTypeOf<IsOptional>().toEqualTypeOf<true>()
        expectTypeOf<IsReadOnly>().toEqualTypeOf<true>()
    })

    it('ReadOnlyOptional', () => {

        type ReadOnlyOptionalArrayOfString = ReadOnly<Optional<ArrayOfString>>

        type IsOptional = HasModifier<ReadOnlyOptionalArrayOfString, ModifierType.Optional>
        type IsReadOnly = HasModifier<ReadOnlyOptionalArrayOfString, ModifierType.ReadOnly>
        expectTypeOf<IsOptional>().toEqualTypeOf<true>()
        expectTypeOf<IsReadOnly>().toEqualTypeOf<true>()
    })

})

describe('ApplyModifier', () => {
    it('adds a mutator if it is not present', () => {
        const $readOnlyArrayOfString = ensureModifier($arrayOfString, ModifierType.ReadOnly)
        const $readOnlyArrayOfString2 = ensureModifier($readOnlyArrayOfString, ModifierType.ReadOnly)
        expect($readOnlyArrayOfString).toBe($readOnlyArrayOfString2)
    })
})

describe('mutatorsOf', () => {

    it('get list of mutators applied to a validator', () => {
        expect(modifiersOf($arrayOfString)).toEqual([])
        expect(modifiersOf(new Optional($arrayOfString))).toEqual([ModifierType.Optional])
        expect(modifiersOf(new ReadOnly(new Optional($arrayOfString)))).toEqual([ModifierType.ReadOnly, ModifierType.Optional])
    })

})

describe('isModifier', () => {

    it('returns true if validator is a mutator', () => { 
        expect(isModifier($arrayOfString)).toBe(false)
        expect(isModifier(new Optional($arrayOfString))).toBe(true)
    })

})

