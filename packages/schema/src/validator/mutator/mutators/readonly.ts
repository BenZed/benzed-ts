import { Func, OutputOf } from '@benzed/util'
import { AnyValidate, ValidateOptions } from '../../../validate'

import { $$target, Mutator, MutatorType } from '../mutator'
import { removeMutator, RemoveMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper TYpes ////

type _InheritReadonly<T> = T extends AnyValidate
    ? ReadOnly<T> 
    : T extends Func
        ? ReturnType<T> extends AnyValidate 
            ? (...params: Parameters<T>) => Readonly<ReturnType<T>>
            : T
        : T

//// Types ////

type Writable<V extends AnyValidate> = RemoveMutator<V, MutatorType.ReadOnly>

type ReadOnly<T extends AnyValidate> = Mutator<T, MutatorType.ReadOnly, Readonly<OutputOf<T>>> & { writable: T }

interface ReadOnlyConstructor {
    new <V extends AnyValidate>(validator: V): ReadOnly<V>
}

// export type ReadOnly<V extends AnyValidate> =
//     Mutator<Writable<V>, M.ReadOnly, Readonly<OutputOf<Writable<V>>>> &
//     MutatorProperties<Writable<V>>

//// Implementation ////  

const ReadOnly = class extends Mutator<AnyValidate, MutatorType.ReadOnly, unknown> {

    constructor(target: AnyValidate) {
        const writableTarget = removeMutator(target, MutatorType.ReadOnly)
        super(writableTarget, MutatorType.ReadOnly)
    }

    validate(input: unknown, options?: ValidateOptions | undefined): unknown {
        return this[$$target](input, options)
    }

    get writable(): AnyValidate {
        return this[$$target]
    }

} as ReadOnlyConstructor

//// Exports ////

export {
    ReadOnly,
    Writable
}