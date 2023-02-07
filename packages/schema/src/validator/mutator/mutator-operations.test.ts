
import { it } from '@jest/globals'
import { isArray, isString as isString } from '@benzed/util'
import { expectTypeOf } from 'expect-type'

import {
    AddMutator, 
    RemoveMutator, 
    HasMutator,
    addMutators,
    removeMutator, 
    hasMutator,
    ensureMutator,
    mutatorsOf,
    isMutator
} from './mutator-operations'

import { Optional, ReadOnly } from './mutators'
import { $$target, MutatorType as M, MutatorType } from './mutator'

import { ContractValidator } from '../contract-validator'
import { ValidatorStruct } from '../validator-struct'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Test ////

interface To<O> extends ValidatorStruct<unknown, O> {}

interface String extends To<string> {}
const $string: String = ContractValidator.generic({
    message() {
        return 'Must be a string'
    },
    isValid: isString
})

interface ArrayOfString extends To<string[]> {}
const $arrayOfString: ArrayOfString = ContractValidator.generic({
    message() {
        return 'Must be an array of string'
    },
    isValid: (i): i is string[] => isArray(i, isString)
})

//// Tests ////

describe('AddMutator', () => {
 
    it('Optional', () => {
        type OptionalString = AddMutator<String, M.Optional>
        expectTypeOf<OptionalString>().toEqualTypeOf<Optional<String>>()

        // Doesn't nest
        for (const $optionalString of [
            addMutators($string, M.Optional), 
            addMutators($string, M.Optional, M.Optional) 
        ]) {

            expect($optionalString).toBeInstanceOf(Optional)
            expect($optionalString[$$target]).toBe($string) 
            expectTypeOf($optionalString).toEqualTypeOf<Optional<String>>()
        }

    }) 

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = AddMutator<ArrayOfString, M.ReadOnly>
        expectTypeOf<ReadonlyArrayOfString>().toEqualTypeOf<ReadOnly<ArrayOfString>>()

        // Doesn't nest
        for (const $readonlyArrayOfString of [
            addMutators($arrayOfString, M.ReadOnly), 
            addMutators($arrayOfString, M.ReadOnly, M.ReadOnly)
        ]) {
            expectTypeOf($readonlyArrayOfString).toEqualTypeOf<ReadOnly<ArrayOfString>>()
            expect($readonlyArrayOfString).toBeInstanceOf(ReadOnly)
            expect($readonlyArrayOfString[$$target]).toBe($arrayOfString) 
        }
    })

})

describe('RemoveMutator', () => {

    it('Optional', () => {
        type OptionalString = Optional<String>
        type String1 = RemoveMutator<OptionalString, M.Optional>

        const $optionalString = new Optional($string)
        const $string1 = removeMutator($optionalString, M.Optional)
        expect($string1).toBe($string)
        expectTypeOf<String1>().toEqualTypeOf($string1)
    })

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = ReadOnly<ArrayOfString>
        type ArrayOfString1 = RemoveMutator<ReadonlyArrayOfString, M.ReadOnly>

        const $readonlyArrayOfString = new ReadOnly($arrayOfString)
        const $arrayOfString1 = removeMutator($readonlyArrayOfString, M.ReadOnly)
        expectTypeOf<ArrayOfString1>().toEqualTypeOf($arrayOfString1)
    })

})

describe('HasMutator', () => {

    it('Optional', () => {
        type OptionalString = Optional<String>
        const $optionalString = new Optional($string)

        type IsOptional = HasMutator<OptionalString, M.Optional>
        expectTypeOf<IsOptional>().toEqualTypeOf<true>()
        expect(hasMutator($optionalString, M.Optional)).toBe(true)

        type IsReadonly = HasMutator<OptionalString, M.ReadOnly>
        expectTypeOf<IsReadonly>().toEqualTypeOf<false>()

    })

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = ReadOnly<ArrayOfString>
        const $readOnlyArrayOfString = new ReadOnly($arrayOfString)

        type IsOptional = HasMutator<ReadonlyArrayOfString, M.Optional>
        expectTypeOf<IsOptional>().toEqualTypeOf<false>()
        expect(hasMutator($readOnlyArrayOfString, M.Optional)).toBe(false)

        type IsReadonly = HasMutator<ReadonlyArrayOfString, M.ReadOnly>
        expectTypeOf<IsReadonly>().toEqualTypeOf<true>()
        expect(hasMutator($readOnlyArrayOfString, M.ReadOnly)).toBe(true)
    })

    it('OptionalReadOnly', () => {

        type OptionalReadOnlyArrayOfString = Optional<ReadOnly<ArrayOfString>>

        type IsOptional = HasMutator<OptionalReadOnlyArrayOfString, M.Optional>
        type IsReadOnly = HasMutator<OptionalReadOnlyArrayOfString, M.ReadOnly>
        expectTypeOf<IsOptional>().toEqualTypeOf<true>()
        expectTypeOf<IsReadOnly>().toEqualTypeOf<true>()
    })

    it('ReadOnlyOptional', () => {

        type ReadOnlyOptionalArrayOfString = ReadOnly<Optional<ArrayOfString>>

        type IsOptional = HasMutator<ReadOnlyOptionalArrayOfString, M.Optional>
        type IsReadOnly = HasMutator<ReadOnlyOptionalArrayOfString, M.ReadOnly>
        expectTypeOf<IsOptional>().toEqualTypeOf<true>()
        expectTypeOf<IsReadOnly>().toEqualTypeOf<true>()
    })

})

describe('ApplyMutator', () => {
    it('adds a mutator if it is not present', () => {
        const $readOnlyArrayOfString = ensureMutator($arrayOfString, M.ReadOnly)
        const $readOnlyArrayOfString2 = ensureMutator($readOnlyArrayOfString, M.ReadOnly)
        expect($readOnlyArrayOfString).toBe($readOnlyArrayOfString2)
    })
})

describe('mutatorsOf', () => {

    it('get list of mutators applied to a validator', () => {
        expect(mutatorsOf($arrayOfString)).toEqual([])
        expect(mutatorsOf(new Optional($arrayOfString))).toEqual([MutatorType.Optional])
        expect(mutatorsOf(new ReadOnly(new Optional($arrayOfString)))).toEqual([MutatorType.ReadOnly, MutatorType.Optional])
    })

})

describe('isMutator', () => {

    it('returns true if validator is a mutator', () => { 
        expect(isMutator($arrayOfString)).toBe(false)
        expect(isMutator(new Optional($arrayOfString))).toBe(true)
    })

})

