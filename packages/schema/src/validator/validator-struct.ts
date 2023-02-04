import { equals } from '@benzed/immutable'

import { ValidateOptions } from '../validate'
import ValidationContext from '../validation-context'
import { ValidateStruct } from './validate-struct'
import { Validator } from './validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// ValidatorStruct ////

/**
 * Default for Callable Validator structs. Quite simply, it calls
 * it's own validate method, and we never have to worry about passing a
 * different callable signature into any extended classes.
 */
export function validate<I, O extends I>(
    this: Validator<I,O>, 
    input: I, 
    options?: ValidateOptions
): O {
    return this.validate(input, options)
}

/**
 * Most of the rest of the methods in this library will inherit from 
 * ValidatorStruct. A validator struct is both a validate method and 
 * a validator, making it the base class for the most widely applicable 
 * object for fulfilling validation interface related contracts.
 */
export abstract class ValidatorStruct<I, O extends I = I>
    extends ValidateStruct<I,O>
    implements Validator<I,O> {

    constructor() {
        super(validate)
    }

    abstract validate(input: I, options?: ValidateOptions): O

    /**
     * Logic for determining if an input is equal to it's output and
     * vise versa, so overridden implementations should be transitive.
     *
     * This defaults to a deep equality check according to the
     * default @benzed/immutable $$equal algorithm.
     */
    equal<T extends I | O>(input: I | O, output: T): input is T {
        return equals(input, output)
    }

    message(ctx: ValidationContext<I>): string {
        void ctx
        return `${this.name} validation failed.`
    }

}

export type AnyValidatorStruct= ValidatorStruct<any,any>
