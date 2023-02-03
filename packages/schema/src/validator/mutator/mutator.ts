import { KeysOf, OutputOf } from '@benzed/util'

import { AnyValidate } from '../../validate'
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

//// Symbol ////

const $$target = Symbol('mutate-target')
const $$type = Symbol('mutate-type')

const $$get = Symbol('mutator-get')
const $$set = Symbol('mutator-set')
const $$apply = Symbol('mutator-apply')

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

abstract class Mutator<
    V extends AnyValidate, 
    T extends MutatorType, 
    O = OutputOf<V>
> extends ValidatorStruct<unknown, O> {

    static $$type = $$type
    static $$target = $$target

    static readonly add = addMutators
    static readonly has = hasMutator
    static readonly ensure = ensureMutator
    static readonly remove = removeMutator
    static readonly removeAll = removeAllMutators
    static readonly each = eachMutator
    static readonly get = getMutators
    static readonly is = isMutator

    protected readonly [$$type]: T
    protected readonly [$$target]: V

    constructor(validate: V, type: T) {
        super()

        this[$$target] = validate
        this[$$type] = type

        return new Proxy(this, {
            get: this[$$get],
            // set: this[$$set],
            // ownKeys: this[$$ownKeys],
            // apply: this[$$apply]
        }) as this
    }

    protected [$$get](
        mutator: this, 
        key: string | symbol, 
        proxy: typeof Proxy
    ): unknown {

        const target = key in mutator
            ? mutator 
            : mutator[$$target]

        return Reflect.get(target, key, proxy)
    }

}

//// Exports ////

export {

    AnyMutator,

    Mutator,
    MutatorType,
    MutatorProperties,

    $$target,
    $$type
}