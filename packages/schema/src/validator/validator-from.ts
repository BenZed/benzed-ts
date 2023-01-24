import { isFunc, Infer } from '@benzed/util'

import Validate, { AnyValidate } from './validate'

import Validator, { GenericValidatorSettings, ValidatorPredicate, ValidatorSettings, ValidatorTransform, ValidatorTypeGuard } from './validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type _ToValidator<A extends GenericValidatorSettings> = 
    // Type from type guard
    A extends { isValid: ValidatorTypeGuard<infer I, infer O> }
        ? Validator<I, O>

    // Type from transform
        : A extends { transform: ValidatorTransform<infer I, infer O> } 
            ? Validator<I, O>

        // Type from predicate
            : A extends { isValid: ValidatorPredicate<infer I> }
                ? Validator<I, I>
                : never

type ToValidator<A extends GenericValidatorSettings> = 
    Infer<_ToValidator<A> & ValidatorOverrides<A>, Validate<any>>

type ValidatorOverrides<A extends object> = Infer<{
    [K in Exclude<keyof A, keyof ValidatorSettings<unknown>>]: A[K]
}, GenericValidatorSettings>

type ValidatorFrom<V extends AnyValidate | GenericValidatorSettings> = V extends GenericValidatorSettings
    ? ToValidator<V>
    : V

//// Main ////

/**
 * Convert the given input to a validator, if it isn't one already.
 */
function validatorFrom<V extends AnyValidate | GenericValidatorSettings>(settings: V): ValidatorFrom<V> {
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