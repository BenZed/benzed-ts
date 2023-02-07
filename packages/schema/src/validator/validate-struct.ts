import { 
    $$state,
    applyState, 

    Struct, 
    StructState, 
    StructStateApply,

    $$equals,
    equals, 

    $$copy,
    copy,
    copyWithoutState,

} from '@benzed/immutable'

import {
    Validate
} from '../validate'

import {
    ValidatorProxy
} from './validator-proxy'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// ValidateStruct ////

/**
 * Transferrable immutable state base class for any method that validates.
 */
export abstract class ValidateStruct<I, O extends I = I> extends Struct<Validate<I,O>> { 

    static $$clone = $$copy
    static $$equal = $$equals
    static $$settings = $$state

    /**
     * Create a deep clone of a value
     */
    static clone<T>(
        value: T
    ): T {
        return copy(value)
    }

    /**
     * Determine if two values are deeply value equal
     */
    static equal = equals

    /**
     * Clone a validator without any state.
     */
    static cloneWithoutState<T extends AnyValidateStruct>(
        validator: T
    ): T {
        return copyWithoutState(validator)
    }

    /**
     * Apply settings to a validator
     */
    static applySettings<T extends AnyValidateStruct>(
        validator: T, 
        state: ValidateUpdateSettings<T>
    ): T {
        return applyState(validator, state)
    }

}

export type AnyValidateStruct = ValidateStruct<any,any>

export type ValidateSettings<V extends AnyValidateStruct> = V extends ValidatorProxy<infer Vx, any,any> 
    ? ValidateSettings<Vx>
    : StructState<V>

export type ValidateUpdateSettings<V extends AnyValidateStruct> = StructStateApply<V>

export {
    $$state as $$settings,
    $$copy as $$clone,
    $$equals as $$equal
}