import { KeysOf, OutputOf } from '@benzed/util'
import { AnyValidatorStruct } from '../../validator-struct'

import { $$target, $$type, Mutator, MutatorType } from '../mutator'
import { assertUnMutated, RemoveMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _ReadOnlyProperties<V extends AnyValidatorStruct> = 
    Mutator<V, MutatorType.ReadOnly, Readonly<OutputOf<V>>> 
    & {
        get writable(): V
    }

type _ReadOnlyInheritKeys<V extends AnyValidatorStruct> = 
    Exclude<KeysOf<V>, KeysOf<_ReadOnlyProperties<V>>>

type _ReadOnlyWrapBuilderOutput<V extends AnyValidatorStruct, P> = P extends V
    ? ReadOnly<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => ReadOnly<V> 
        : P

type _ReadOnlyInherit<V extends AnyValidatorStruct> = {
    [K in _ReadOnlyInheritKeys<V>]: _ReadOnlyWrapBuilderOutput<V, V[K]>
}

//// Types ////

type Writable<V extends AnyValidatorStruct> =
    RemoveMutator<V, MutatorType.ReadOnly>

type ReadOnly<V extends AnyValidatorStruct> = 
    _ReadOnlyProperties<V> &
    _ReadOnlyInherit<V>

interface ReadOnlyConstructor {
    new <V extends AnyValidatorStruct>(validator: V): ReadOnly<V>
}

//// Implementation ////  

const ReadOnly = class extends Mutator<AnyValidatorStruct, MutatorType.ReadOnly, unknown> {

    constructor(target: AnyValidatorStruct) {
        assertUnMutated(target, MutatorType.ReadOnly)
        super(target)
    }

    protected get [$$type](): MutatorType.ReadOnly {
        return MutatorType.ReadOnly
    }

    get writable(): AnyValidatorStruct {
        return this[$$target]
    }

} as unknown as ReadOnlyConstructor

//// Exports ////

export {
    ReadOnly,
    Writable
}