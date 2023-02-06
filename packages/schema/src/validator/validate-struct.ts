import { 
    $$state,
    applyState, 

    Struct, 
    StructState, 
    StructStateApply,

    equals, 

    $$copy,
    copy,
    copyWithoutState,

} from '@benzed/immutable'

import {
    Validate
} from '../validate'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// ValidateStruct ////

/**
 * Transferrable immutable state base class for any method that validates.
 */
export abstract class ValidateStruct<I, O extends I = I> extends Struct<Validate<I,O>> { 

    static $$settings = $$state

    static deepEqual = equals

    static applySettings<T extends AnyValidateStruct>(
        validator: T, 
        state: ValidatorUpdateSettings<T>
    ): T {
        return applyState(validator, state)
    }

    static clone<T>(
        value: T
    ): T {
        return copy(value)
    }

    static cloneWithoutState<T extends AnyValidateStruct>(
        validator: T
    ): T {
        return copyWithoutState(validator)
    }

}

export type AnyValidateStruct = ValidateStruct<any,any>

export type ValidatorSettings<V extends AnyValidateStruct> = StructState<V>

export type ValidatorUpdateSettings<V extends AnyValidateStruct> = StructStateApply<V>

export {
    $$state as $$settings,
    $$copy as $$clone
}