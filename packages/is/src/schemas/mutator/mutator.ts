import { AbstractValidate, AnyValidate, Validate } from '@benzed/schema'
import { KeysOf, merge, OutputOf, Property } from '@benzed/util'

import { 
    isMutator,
    addMutators, 
    applyMutator, 
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
> extends AbstractValidate<unknown, O> {

    static readonly add = addMutators
    static readonly has = hasMutator
    static override readonly apply = applyMutator
    static readonly remove = removeMutator
    static readonly removeAll = removeAllMutators
    static readonly each = eachMutator
    static readonly get = getMutators
    static readonly is = isMutator

    constructor(
        readonly target: V,
        readonly mutator: T
    ) {
        super(target)
        this._mutate()
    }

    //// ValueCopy ////

    override copy(): this {
        const clone = super.copy()
        clone._mutate()
        return clone
    }

    override get state(): Partial<this> {
        const {
            target,
            mutator,
        } = this

        return {
            target,
            mutator
        } as unknown as Partial<this>
    }

    protected override set state(value: Partial<this>) {
        const { target, mutator } = value as this
        merge(
            this, 
            {
                target, 
                mutator, 
            }
        )
    }

    //// Mutator ////

    private _mutate(): void {
        Property.define(this, this._createMutation())
    }

    protected _createMutation(): PropertyDescriptorMap {
        return {}
    }

}

//// Exports ////

export {
    AnyMutator,
    Mutator,
    MutatorType,
    MutatorProperties
}