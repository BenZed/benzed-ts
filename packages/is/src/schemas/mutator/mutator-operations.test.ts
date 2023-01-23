
import { it } from '@jest/globals'
import { isArray, isString as _isString } from '@benzed/util'
import { expectTypeOf } from 'expect-type'

import { Validate, Validator } from '../../../validator'

import {
    AddMutator, 
    RemoveMutator, 
    HasMutator,
    Async,
    Sync,
    addMutators,
    removeMutator,
    hasMutator,
    applyMutator,
    mutatorsOf,
    isMutator
} from './mutator-operations'

import { Optional, ReadOnly } from './mutators'
import { MutatorType as M, MutatorType } from './mutator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Test ////

interface To<O> extends Validate<unknown, O> {}

interface String extends To<string> {}
const $string: String = new Validator({
    error: 'Must be a string',
    is: _isString
})

interface ArrayOfString extends To<string[]> {}
const $arrayOfString: ArrayOfString = new Validator({
    error: 'Must be an array of string',
    is: (i): i is string[] => isArray(i, _isString)
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
            expect($optionalString).toHaveProperty('target', $string) 
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
            expect($readonlyArrayOfString).toHaveProperty('target', $arrayOfString) 
        }
    })

    it('Async', () => {
        type AsyncArrayOfString = AddMutator<ArrayOfString, M.Async>
        expectTypeOf<AsyncArrayOfString>().toEqualTypeOf<To<Promise<string[]>>>()

        type ArrayOfString2 = Async<AsyncArrayOfString>
        expectTypeOf<ArrayOfString2>().toEqualTypeOf<To<Promise<string[]>>>()
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

    it('Async', () => {
        type AsyncArrayOfString = Async<ArrayOfString>
        type ArrayOfString1 = RemoveMutator<AsyncArrayOfString, M.Async>
        expectTypeOf<ArrayOfString1>().toEqualTypeOf<Sync<AsyncArrayOfString>>()
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

        type AsyncOptionalString = Async<Optional<String>>
        expectTypeOf<HasMutator<AsyncOptionalString, M.Async>>().toEqualTypeOf<true>()
        expectTypeOf<HasMutator<AsyncOptionalString, M.Optional>>().toEqualTypeOf<true>()
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

    it('Async', () => {
        type AsyncArrayOfString = Async<ArrayOfString>
        type IsAsync = HasMutator<AsyncArrayOfString, M.Async>
        expectTypeOf<IsAsync>().toEqualTypeOf<true>()

        type IsReadonly = HasMutator<AsyncArrayOfString, M.ReadOnly>
        expectTypeOf<IsReadonly>().toEqualTypeOf<false>()
    })

})

describe('ApplyMutator', () => {
    it('adds a mutator if it is not present', () => {
        const $readOnlyArrayOfString = applyMutator($arrayOfString, M.ReadOnly)
        const $readOnlyArrayOfString2 = applyMutator($readOnlyArrayOfString, M.ReadOnly)
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

