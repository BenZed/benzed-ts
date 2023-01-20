import { 
    AddMutator, 
    Optional,
    ReadOnly,
    Required, 
    MutatorType as M, 
    RemoveMutator, 
    Writable,
    HasMutator,
    Async,
    Sync
} from './mutator'

import { it } from '@jest/globals'
import { expectTypeOf } from 'expect-type'
import { Validate } from '../../../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Test ////

interface To<O> extends Validate<unknown, O> {}

interface String extends To<string> {}

interface ArrayOfString extends To<string[]> {}

//// Tests ////

describe('ApplyMutator', () => {

    it('Optional', () => {
        type OptionalString = AddMutator<String, M.Optional>
        expectTypeOf<OptionalString>().toEqualTypeOf<To<string | undefined>>()

        // doesn't nest
        type OptionalString2 = Optional<OptionalString>
        expectTypeOf<OptionalString2>().toEqualTypeOf<To<string | undefined>>()
    })

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = AddMutator<ArrayOfString, M.ReadOnly>
        expectTypeOf<ReadonlyArrayOfString>().toEqualTypeOf<To<readonly string[]>>()

        // doesn't nest
        type ReadonlyArrayOfString2 = ReadOnly<ReadonlyArrayOfString>
        expectTypeOf<ReadonlyArrayOfString2>().toEqualTypeOf<To<readonly string[]>>()
    })

    it('Async', () => {
        type AsyncArrayOfString = AddMutator<ArrayOfString, M.Async>
        expectTypeOf<AsyncArrayOfString>().toEqualTypeOf<To<Promise<string[]>>>()

        // doesn't nest
        type ArrayOfString2 = Async<AsyncArrayOfString>
        expectTypeOf<ArrayOfString2>().toEqualTypeOf<To<Promise<string[]>>>()
    })

})

describe('RemoveMutator', () => {

    it('Optional', () => {
        type OptionalString = Optional<String>
        type String1 = RemoveMutator<OptionalString, M.Optional>
        expectTypeOf<String1>().toEqualTypeOf<Required<OptionalString>>()
    })

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = ReadOnly<ArrayOfString>
        type ArrayOfString1 = RemoveMutator<ReadonlyArrayOfString, M.ReadOnly>
        expectTypeOf<ArrayOfString1>().toEqualTypeOf<Writable<ReadonlyArrayOfString>>()
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

        type IsOptional = HasMutator<OptionalString, M.Optional>
        expectTypeOf<IsOptional>().toEqualTypeOf<true>()

        type IsReadonly = HasMutator<OptionalString, M.ReadOnly>
        expectTypeOf<IsReadonly>().toEqualTypeOf<false>()

        type AsyncOptionalString = Async<Optional<String>>
        expectTypeOf<HasMutator<AsyncOptionalString, M.Async>>().toEqualTypeOf<true>()
        expectTypeOf<HasMutator<AsyncOptionalString, M.Optional>>().toEqualTypeOf<true>()
    })

    it('ReadOnly', () => {
        type ReadonlyArrayOfString = ReadOnly<ArrayOfString>
        type IsOptional = HasMutator<ReadonlyArrayOfString, M.Optional>
        expectTypeOf<IsOptional>().toEqualTypeOf<false>()

        type IsReadonly = HasMutator<ReadonlyArrayOfString, M.ReadOnly>
        expectTypeOf<IsReadonly>().toEqualTypeOf<true>()
    })

    it('Async', () => {
        type AsyncArrayOfString = Async<ArrayOfString>
        type IsAsync = HasMutator<AsyncArrayOfString, M.Async>
        expectTypeOf<IsAsync>().toEqualTypeOf<true>()

        type IsReadonly = HasMutator<AsyncArrayOfString, M.ReadOnly>
        expectTypeOf<IsReadonly>().toEqualTypeOf<false>()
    })

})