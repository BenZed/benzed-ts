import { OutputOf, nil, NamesOf } from '@benzed/util'
import { ValidateOptions } from '../../../validate'
import { AnyValidateStruct } from '../../validate-struct'

import { Mutator, MutatorType, $$target, $$type } from '../mutator'
import { assertUnMutated, RemoveMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _OptionalProperties<V extends AnyValidateStruct> = 
    Mutator<V, MutatorType.Optional, OutputOf<V> | nil> 
    & {
        get required(): V
    }

type _OptionalInheritKeys<V extends AnyValidateStruct> = 
    Exclude<NamesOf<V>, NamesOf<_OptionalProperties<V>>>

type _OptionalWrapBuilderOutput<V extends AnyValidateStruct, P> = P extends V
    ? Optional<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => Optional<V> 
        : P

type _OptionalInherit<V extends AnyValidateStruct> = {
    [K in _OptionalInheritKeys<V>]: _OptionalWrapBuilderOutput<V, V[K]>
}

//// Types ////

type Required<V extends AnyValidateStruct> = RemoveMutator<V, MutatorType.Optional>

type Optional<V extends AnyValidateStruct> = 
    _OptionalProperties<V> &
    _OptionalInherit<V>

interface OptionalConstructor {
    new <V extends AnyValidateStruct>(validator: V): Optional<V>
}

//// Implementation ////
const Optional = class Optional extends Mutator<AnyValidateStruct, MutatorType.Optional, unknown> {

    //// Constructor ////

    constructor(target: AnyValidateStruct) {
        assertUnMutated(target, MutatorType.Optional)
        super(target)
    }

    get [$$type](): MutatorType.Optional {
        return MutatorType.Optional
    }

    override validate(input: unknown, options?: ValidateOptions): unknown | nil {
        try {
            return this[$$target](input, options)
        } catch (e) {
            if (input === nil)
                return input
            throw e
        }
    }

    //// Convenience ////

    get required(): AnyValidateStruct {
        return this[$$target]
    }

} as unknown as OptionalConstructor

//// Exports ////

export default Optional

export {
    Optional,
    Required
}