import { OutputOf, nil, KeysOf } from '@benzed/util'
import { ValidateOptions } from '../../../validate'
import { AnyValidatorStruct } from '../../validator-struct'

import { Mutator, MutatorType, $$target } from '../mutator'
import { removeMutator, RemoveMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _OptionalProperties<V extends AnyValidatorStruct> = 
    Mutator<V, MutatorType.Optional, OutputOf<V> | nil> 
    & {
        required: V
    }

type _OptionalInheritKeys<V extends AnyValidatorStruct> = 
    Exclude<KeysOf<V>, KeysOf<_OptionalProperties<V>>>

type _OptionalWrapBuilderOutput<V extends AnyValidatorStruct, P> = P extends V
    ? Optional<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => Optional<V> 
        : P

type _OptionalInherit<V extends AnyValidatorStruct> = {
    [K in _OptionalInheritKeys<V>]: _OptionalWrapBuilderOutput<V, V[K]>
}

//// Types ////

type Required<V extends AnyValidatorStruct> = RemoveMutator<V, MutatorType.Optional>

type Optional<V extends AnyValidatorStruct> = 
    _OptionalProperties<V> &
    _OptionalInherit<V>

interface OptionalConstructor {
    new <V extends AnyValidatorStruct>(validator: V): Optional<V>
}

//// Implementation ////
const Optional = class Optional extends Mutator<AnyValidatorStruct, MutatorType.Optional, unknown> {

    //// Constructor ////

    constructor(target: AnyValidatorStruct) {
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

    get required(): AnyValidatorStruct {
        return this[$$target]
    }

} as unknown as OptionalConstructor

//// Exports ////

export default Optional

export {
    Optional,
    Required
}