import { isFunc, Infer } from '@benzed/util'

import { AnyValidate } from './validate'

import Validator, { 
    AnyValidatorSettings, 
    ValidatorTransform, 
    ValidatorTypeGuard 
} from './validator'

//// Types ////

type ToValidator<A extends AnyValidatorSettings> = 
   A extends

   { is: ValidatorTypeGuard<infer I, infer O> } | { transform: ValidatorTransform<infer I, infer O> } 

       ? Validator<I, O> & ValidatorOverrides<A> 
       : never

type ValidatorOverrides<A extends AnyValidatorSettings> = Infer<{
    [K in Exclude<keyof A, keyof AnyValidatorSettings>]: A[K]
}>

type ValidatorFrom<V extends AnyValidate | AnyValidatorSettings> = V extends AnyValidatorSettings
    ? ToValidator<V>
    : V

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
    validatorFrom,
    ValidatorFrom,
    ToValidator
}