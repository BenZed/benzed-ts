import { OutputOf, nil, KeysOf } from '@benzed/util'
import { AnyValidate, ValidateOptions } from '../../../validate'

import { Mutator, MutatorType, $$target } from '../mutator'
import { removeMutator, RemoveMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _OptionalProperties<V extends AnyValidate> = 
    Mutator<V, MutatorType.Optional, OutputOf<V> | nil> 
    & {
        required: V
    }

type _OptionalInheritKeys<V extends AnyValidate> = 
    Exclude<KeysOf<V>, KeysOf<_OptionalProperties<V>>>

type _OptionalWrapBuilderOutput<V extends AnyValidate, P> = P extends V
    ? Optional<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => Optional<V> 
        : P

type _OptionalInherit<V extends AnyValidate> = {
    [K in _OptionalInheritKeys<V>]: _OptionalWrapBuilderOutput<V, V[K]>
}

//// Types ////

type Required<V extends AnyValidate> = RemoveMutator<V, MutatorType.Optional>

type Optional<V extends AnyValidate> = 
    _OptionalProperties<V> &
    _OptionalInherit<V>

interface OptionalConstructor {
    new <V extends AnyValidate>(validator: V): Optional<V>
}

//// Implementation ////
const Optional = class Optional extends Mutator<AnyValidate, MutatorType.Optional, unknown> {

    //// Constructor ////

    constructor(target: AnyValidate) {
        const requiredTarget = removeMutator(target, MutatorType.Optional)
        super(
            requiredTarget, 
            MutatorType.Optional
        )
    }

    validate(input: unknown, options?: ValidateOptions): unknown | nil {
        try {
            return this[$$target](input, options)
        } catch (e) {
            if (input === nil)
                return input
            throw e
        }
    }

    //// Convenience ////

    get required(): AnyValidate {
        return this[$$target]
    }

} as unknown as OptionalConstructor

//// Exports ////

export default Optional

export {
    Optional,
    Required
}