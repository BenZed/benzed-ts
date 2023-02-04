import { $$state, Struct, StructStateLogic } from '@benzed/immutable'
import { KeysOf, OutputOf } from '@benzed/util'

import { AnyValidatorStruct, ValidatorStruct } from '../validator-struct'

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

type AnyMutator = Mutator<AnyValidatorStruct, MutatorType, unknown>

type MutatorProperties<V extends AnyValidatorStruct> = {
    [K in Exclude<keyof V, KeysOf<Mutator<V, MutatorType>>>]: V[K]
}

//// Implementation ////

abstract class Mutator<
    V extends AnyValidatorStruct, 
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
            set: this[$$set],
            // ownKeys: this[$$ownKeys],
            // apply: this[$$apply]

        }) as this
    }

    protected [$$get](
        mutator: this, 
        key: string | symbol, 
        proxy: typeof Proxy
    ): unknown {

        console.log(key)

        const target = Reflect.has(mutator, key)
            ? mutator 
            : mutator[$$target]

        return Reflect.get(target, key, proxy)
    }

    protected [$$set](
        mutator: this, 
        key: string | symbol, 
        value: unknown,
        proxy: typeof Proxy
    ): boolean {

        if (key === $$state) {
            mutator[$$state] = value
            return true
        }

        const target = key === $$state
            ? mutator 
            : mutator[$$target]

        return Reflect.set(target, key, value, proxy)
    }

    override get name(): string {
        return this.constructor.name
    }

    override get [$$state](): any {

        const target = this[$$target] as unknown as StructStateLogic<V>
        const targetState = target[$$state]

        const state = { 
            ...targetState, 
            [$$target]: this[$$target],
            [$$type]: this[$$type]
        }

        return state
    }

    override set [$$state](state: any) {

        console.log(this.name, 'SET STATE', state)

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