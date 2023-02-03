import { $$copy, $$state } from '@benzed/immutable'
import { assign, KeysOf, OutputOf, Property } from '@benzed/util'

import { AnyValidate, Validate } from '../../validate'
import { ValidatorStruct } from '../validator-struct'

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

//// Types ////

enum MutatorType {
    Optional,
    ReadOnly,
    Not,
    // And,
    // Or,
    Async
}

type AnyMutator = Mutator<AnyValidate, MutatorType, unknown>

type MutatorProperties<V extends AnyValidate> = {
    [K in Exclude<keyof V, KeysOf<Mutator<V, MutatorType>>>]: V[K]
}

//// Implementation ////

class Mutator<
    V extends AnyValidate, 
    T extends MutatorType, 
    O = OutputOf<V>
> extends ValidatorStruct<unknown, O> {

    static readonly add = addMutators
    static readonly has = hasMutator
    static readonly ensure = ensureMutator
    static readonly remove = removeMutator
    static readonly removeAll = removeAllMutators
    static readonly each = eachMutator
    static readonly get = getMutators
    static readonly is = isMutator

    constructor(
        readonly target: V,
        readonly mutator: T
    ) {
        super()
        this.validate = this.target
        this._mutate()
    }

    readonly validate: Validate<unknown, O>

    //// ValueCopy ////

    override set [$$state](state: Partial<this>) {
        assign(this, state)
        this._mutate()
    }

    //// Mutator ////

    private _mutate(): void {
        Property.define(this, this._createMutation())
    }

    protected _createMutation(): PropertyDescriptorMap {
        return {
            validate: {
                get(this: Mutator<V,T,O>) {
                    return this.target
                }
            }
        }
    }

}

//// Exports ////

export {
    AnyMutator,
    Mutator,
    MutatorType,
    MutatorProperties
}