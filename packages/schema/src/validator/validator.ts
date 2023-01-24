
import { equals, Struct } from '@benzed/immutable'
import {
    ParamTransform, 
    applyResolver, 
    isFunc,
    Property,
    assign,
    Func,
    nil,
} from '@benzed/util'

import { ValidateContext } from './validate-context'
import { Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError } from './validate-error'

import validatorFrom, { ToValidator } from './validator-from'
import validatorMerge from './validator-merge'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Settings ////

interface ValidatorSettings<I, O = I> {
    name: string
    error: string | ValidationErrorMessage<I>
    isValid: O extends I
        ? ValidatorPredicate<I> | ValidatorTypeGuard<I, O>
        : ValidatorPredicate<I>
    transform: ValidatorTransform<I, O>

}

type GenericValidatorSettings = Record<string, unknown>

//// Setting Methods ////

type ValidatorTypeGuard<I, O extends I = I> = (
    input: I, 
    ctx: ValidateContext<I>
) => input is O

type ValidatorPredicate<I> = ParamTransform<I, boolean, [ValidateContext<I>]>
type ValidatorTransform<I, O = I> = ParamTransform<I, I | O, [ValidateContext<I>]>

//// Validator Type ////

interface Validator<I, O = I> extends Validate<I,O>, ValidatorSettings<I,O>, Struct {}

interface ValidatorConstructor {

    from: typeof validatorFrom
    merge: typeof validatorMerge

    new <I, O extends I = I>(settings: Partial<ValidatorSettings<I,O>>): Validator<I,O>
    new <S extends GenericValidatorSettings>(settings: S): ToValidator<S>

}

//// Validate Method ////

function validate<I, O>(this: Validator<I,O>, input: I, options?: Partial<ValidateOptions>): O {

    const ctx = new ValidateContext(input, options)

    const output = applyResolver(
        this.transform(input, ctx),
        resolved => {

            ctx.value = resolved as I

            const output = ctx.transform 
                ? ctx.value
                : input

            if (!this.isValid(output, ctx))
                throw new ValidationError(this, ctx)

            return output
        })

    return output as O
}

/**
 * If a validator method is overridden, ensure that it is enumerable.
 */
function override<I,O>(
    validator: Validate<I,O>, 
    name: 'isValid' | 'transform', 
    method: Func | nil
): void {

    if (!isFunc(method)) 
        return

    Property.define(
        validator, 
        name, 
        { 
            value: method, 
            enumerable: true, 
            configurable: true
        })
}

//// Main ////

const Validator = class <I, O extends I = I> extends Validate<I, O> {

    static from = validatorFrom

    static merge = validatorMerge

    constructor(
        { name, error, isValid, transform, ...settings }: Partial<ValidatorSettings<I,O>>
    ) {

        super(validate)
        this.name = name ?? this.constructor.name
        this.error = error ?? (this.name === this.constructor.name 
            ? 'Validation failed.'
            : `Must be ${this.name}.`)

        override(this, 'isValid', isValid)
        override(this, 'transform', transform)
        assign(this, settings)

    }

    override readonly name: string
    readonly error: string | ValidationErrorMessage<I>
    
    isValid(input: I, ctx: ValidateContext<I>): input is O {
        return equals(input, ctx.value)
    }

    transform(input: I, _ctx: ValidateContext<I>): I | O {
        return input
    }

} as ValidatorConstructor

//// Exports ////

export default Validator 

export {
    Validator,
    ValidatorSettings,
    ValidatorPredicate,
    ValidatorTypeGuard,
    ValidatorTransform,

    GenericValidatorSettings

}