import { isFunc } from '@benzed/util'

import { AnyValidate } from './validate'

import { Validator, AnyValidatorSettings, ToValidator } from '../validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type ValidatorFrom<V extends AnyValidate | AnyValidatorSettings> = V extends AnyValidate
    ? V
    : V extends AnyValidatorSettings 
        ? ToValidator<V>
        : never

//// Main ////

/**
 * Convert the given input to a validator, if it isn't one already.
 */
function validatorFrom<V extends AnyValidate | AnyValidatorSettings>(settings: V): ValidatorFrom<V> {
    const validator = isFunc(settings) 
        ? settings 
        : new Validator(settings)

    return validator as ValidatorFrom<V>
}
//// Exports ////

export default validatorFrom

export {
    validatorFrom
}