import { OutputOf, nil } from '@benzed/util'
import { AnyValidate, ValidateOptions } from '../../../validate'

import { Mutator, MutatorType } from '../mutator'
import { removeMutator, RemoveMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

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