
import { ValidateOptions } from '../validate'
import { ValidationErrorMessage } from '../validation-error'

import { ValidateStruct } from './validate-struct'

import { Validator } from './validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Validator Method ////

/**
 * Validation signature for Validtor Structs. Quite simply, it calls
 * it's own validate method, and we never have to worry about passing a
 * different callable signature into any extended classes.
 */
function validate<I, O extends I>(
    this: Validator<I,O>, 
    input: I, 
    options?: ValidateOptions
): O {
    return this.validate(input, options)
}

//// ValidatorStruct ////

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

        // IntegerValidator -> Integer 
        // IntegerValidatorStruct -> Integer
        // ValidatorStruct -> Validate 
        // 
        // this.name = this.constructor
        //     .name
        //     .replace('Validator', '')
        //     .replace('Struct', '') 
        //     || 'Validate'
    }

    // override readonly name: string

    abstract validate(input: I, options?: ValidateOptions): O

}

export type AnyValidatorStruct = ValidatorStruct<any>

