import { $$state, StructState } from '@benzed/immutable'
import { InputOf, OutputOf } from '@benzed/util'
import { ValidateOptions } from '../../validate'

import { 
    AnyValidatorStruct, 
    ValidatorStruct 
} from '../validator-struct'

import {
    $$target,
    ValidatorProxy
} from './validator-proxy'

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

type MutatorState<V extends AnyValidatorStruct, T extends MutatorType> = 
    StructState<V> & {
        [$$target]: V
        [$$type]: T
    }

//// Implementation ////

abstract class Mutator<
    V extends AnyValidatorStruct, 
    T extends MutatorType, 
    O extends InputOf<V> = OutputOf<V> extends InputOf<V> ? OutputOf<V> : never
> extends ValidatorProxy<V, InputOf<V>, O> {

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
    
    constructor(validate: V, type: T) {
        super(validate)

        this[$$type] = type
    }

    protected readonly [$$type]: T

    //// ValidatorStruct Implementation ////
    
    override get name(): string {
        return this.constructor.name
    }

    validate(input: unknown, options?: ValidateOptions): O {
        return this[$$target](input, options)
    }

    //// Struct ////

    override get [$$state](): MutatorState<V,T> {

        const target = this[$$target]
        const targetState = target[$$state]

        const state = { 
            ...targetState, 
            [$$target]: this[$$target],
            [$$type]: this[$$type]
        }

        return state
    }

    override set [$$state](state: MutatorState<V,T>) {

        const { [$$target]: target, [$$type]: type, ...targetState } = state

        const that = this as any
        that[$$type] = type
        that[$$target] = ValidatorStruct.applyState(
            target, 
            targetState as StructState<V>
        )
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