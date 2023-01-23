
import { equals, Struct } from '@benzed/immutable'
import {
    ParamTransform, 
    applyResolver, 
    isFunc,
    Property,
    assign,
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

    id?: symbol
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
        this.transform(ctx.input, ctx), 
        transformed => {

            ctx.transformed = transformed as I

            const output = ctx.transform 
                ? ctx.transformed
                : ctx.input

            if (!this.isValid(output, ctx))
                throw new ValidationError(this, ctx)

            return output
        })

    return output as O
}

/**
 * If a method is overridden, ensure that it is enumerable.
 */
function override<I,O>(validator: Validate<I,O>, name: string, method: unknown): void {

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
        { name, error, id, isValid, transform, ...settings }: Partial<ValidatorSettings<I,O>>
    ) {

        super(validate)
        this.name = name ?? this.constructor.name
        this.error = error ?? (this.name === this.constructor.name 
            ? 'Validation failed.'
            : `Must be ${this.name}.`)

        if (id)
            this.id = id

        override(this, 'isValid', isValid)
        override(this, 'transform', transform)
        assign(this, settings)

    }

    override readonly name: string
    readonly error: string | ValidationErrorMessage<I>
    readonly id?: symbol
    
    isValid(input: I, ctx: ValidateContext<I>): input is O {
        return equals(input, ctx.transformed)
    }

    transform(input: I, ctx: ValidateContext<I>): I | O {
        ctx.transformed = input
        return input
    }

} as ValidatorConstructor

//// Exports ////

export default Validator 

export {
    Validator,
    ValidatorSettings,
    GenericValidatorSettings,
    ValidatorPredicate,
    ValidatorTypeGuard,
    ValidatorTransform,

}