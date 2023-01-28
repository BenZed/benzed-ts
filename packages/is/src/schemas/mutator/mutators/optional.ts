import { OutputOf, nil } from '@benzed/util'

import { AnyValidate, ValidateOptions } from '../../../../../schema/src/validator'

import { Mutator, MutatorType } from '../mutator'
import { removeMutator, RemoveMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

// type _InheritOptional<T> = T extends AnyValidate
//     ? Optional<T>
//     : T extends Func
//         ? ReturnType<T> extends AnyValidate 
//             ? (...params: Parameters<T>) => Optional<ReturnType<T>>
//             : T
//         : T

//// Types ////
type Required<V extends AnyValidate> = RemoveMutator<V, MutatorType.Optional>

type Optional<V extends AnyValidate> = 
    & Mutator<V, MutatorType.Optional, OutputOf<V> | nil> 
    & {
        required: V
    }

//// Helper ////
function validateOptional(
    this: Optional<AnyValidate>, 
    input: unknown, 
    options?: ValidateOptions
): unknown | nil {
    try {
        return this['target'](input, options)
    } catch (e) {
        if (input === nil)
            return input
        throw e
    }
}

//// Implementation ////
const Optional = class extends Mutator<AnyValidate, MutatorType.Optional, unknown> {

    //// Constructor ////
    constructor(target: AnyValidate) {

        const requiredTarget = removeMutator(target, MutatorType.Optional)
        super(
            requiredTarget, 
            MutatorType.Optional
        )
    }

    //// Convenience ////
    get required(): AnyValidate { 
        return this.target
    }

    //// Helper ////
    protected override _createMutation(): PropertyDescriptorMap {
        return {
            validate: {
                value: validateOptional,
                enumerable: true
            }
        }
    }
} as unknown as new <T extends AnyValidate>(ref: T) => Optional<Required<T>>

//// Exports ////

export default Optional

export {
    Optional,
    Required
}