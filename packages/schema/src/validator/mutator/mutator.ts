import { OutputOf } from '@benzed/util'

import { ValidateOptions } from '../../validate'

import { AnyValidatorStruct } from '../validator-struct'

import {
    $$target,
    ValidatorProxy
} from '../validator-proxy'

import {

    isMutator,
    addMutators,
    ensureMutator,
    eachMutator,
    hasMutator,
    removeAllMutators,
    removeMutator,
    getMutators

} from './mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbol ////

const $$type = Symbol('mutate-type')

//// Types ////

enum MutatorType {
    Optional,
    ReadOnly,
    Not,
    // Async
    // ArrayOf
}

type AnyMutator = Mutator<AnyValidatorStruct, MutatorType, unknown>

//// Implementation ////

abstract class Mutator<
    V extends AnyValidatorStruct, 
    T extends MutatorType, 
    O = OutputOf<V>
> extends ValidatorProxy<V, unknown, O> {

    static $$type = $$type

    static readonly add = addMutators
    static readonly has = hasMutator
    static readonly ensure = ensureMutator
    static readonly remove = removeMutator
    static readonly removeAll = removeAllMutators
    static readonly each = eachMutator
    static readonly get = getMutators
    static readonly is = isMutator

    //// Constructor ////

    protected abstract get [$$type](): T
 
    //// ValidatorStruct Implementation ////
    
    override get name(): string {
        return this.constructor.name
    }

    validate(input: unknown, options?: ValidateOptions): O {
        return this[$$target](input, options)
    }

}

//// Exports ////

export {
 
    AnyMutator,

    Mutator,
    MutatorType,

    $$target,
    $$type
}