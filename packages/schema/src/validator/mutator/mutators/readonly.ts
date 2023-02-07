import { KeysOf, OutputOf } from '@benzed/util'
import { AnyValidateStruct } from '../../validate-struct'

import { $$target, $$type, Mutator, MutatorType } from '../mutator'
import { assertUnMutated, RemoveMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _ReadOnlyProperties<V extends AnyValidateStruct> = 
    Mutator<V, MutatorType.ReadOnly, Readonly<OutputOf<V>>> 
    & {
        get writable(): V
    }

type _ReadOnlyInheritKeys<V extends AnyValidateStruct> = 
    Exclude<KeysOf<V>, KeysOf<_ReadOnlyProperties<V>>>

type _ReadOnlyWrapBuilderOutput<V extends AnyValidateStruct, P> = P extends V
    ? ReadOnly<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => ReadOnly<V> 
        : P

type _ReadOnlyInherit<V extends AnyValidateStruct> = {
    [K in _ReadOnlyInheritKeys<V>]: _ReadOnlyWrapBuilderOutput<V, V[K]>
}

//// Types ////

type Writable<V extends AnyValidateStruct> =
    RemoveMutator<V, MutatorType.ReadOnly>

type ReadOnly<V extends AnyValidateStruct> = 
    _ReadOnlyProperties<V> &
    _ReadOnlyInherit<V>

interface ReadOnlyConstructor {
    new <V extends AnyValidateStruct>(validator: V): ReadOnly<V>
}

//// Implementation ////  

const ReadOnly = class extends Mutator<AnyValidateStruct, MutatorType.ReadOnly, unknown> {

    constructor(target: AnyValidateStruct) {
        assertUnMutated(target, MutatorType.ReadOnly)
        super(target)
    }

    protected get [$$type](): MutatorType.ReadOnly {
        return MutatorType.ReadOnly
    }

    get writable(): AnyValidateStruct {
        return this[$$target]
    }

} as unknown as ReadOnlyConstructor

//// Exports ////

export {
    ReadOnly,
    Writable
}