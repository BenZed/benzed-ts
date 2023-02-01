import { Struct } from '@benzed/immutable'
import { provideCallableContext } from '@benzed/util'

import { ValidateOptions } from '../validate'
import { ValidateStruct, ValidateUpdateState } from './validate-struct'
import { Validator } from './validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// ValidatorStruct ////

/**
 * Default for Callable Validator structs. Quite simply, it calls the
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
        super(validate, provideCallableContext)
    }

    abstract validate(input: I, options?: ValidateOptions): O

}

export type AnyValidatorStruct= ValidatorStruct<any,any>
