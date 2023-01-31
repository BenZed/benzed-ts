import { CallableStruct, Struct, StructAssignState } from '@benzed/immutable'
import { provideCallableContext } from '@benzed/util'

import { Validate, ValidateOptions } from '../validate'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Validator ////

/**
 * 
 * @public
 * Any object with a validate method that validates based
 * on it's configuration.
 */
export interface Validator<I, O extends I> {

    readonly validate: Validate<I,O>

}

export type AnyValidator= Validator<any,any>

export type ValidateState<V extends AnyValidator> = StructAssignState<V>

export type ValidateUpdateState<V extends AnyValidator> = Partial<ValidateState<V>>

//// ValidateStruct////

/**
 * Transferrable immutable state base class for any method that validates.
 */
export abstract class ValidateStruct<I, O extends I = I> extends CallableStruct<Validate<I,O>> implements Struct { }

//// ValidatorStruct ////

function validate<I, O extends I>(this: Validator<I,O>, input: I, options?: ValidateOptions): O {
    return this.validate(input, options)
}

/**
 * Most of the rest of the methods in this library will inherit from ValidatorStruct. A validator struct is both 
 * a validate method and a validator, making it the base class for the most widely applicable object for fulfilling 
 * validation interface related contracts.
 */
export abstract class ValidatorStruct<I, O extends I = I> extends ValidateStruct<I,O> implements Validator<I,O> {

    constructor() {
        super(validate, provideCallableContext)
    }

    abstract validate(input: I, options?: ValidateOptions): O

    /**
     * Instance link to the Struct.apply method, provide
     * a new state to this validator and it will make an immutable
     * copy 
     * @internal
     */
    override apply(state: ValidateUpdateState<this>): this {
        return Struct.apply(this, state)
    }

}
