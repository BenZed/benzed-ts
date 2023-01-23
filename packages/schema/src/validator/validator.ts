
import { equals, Struct } from '@benzed/immutable'
import {
    ParamTransform, 
    applyResolver, 
    merge, 
} from '@benzed/util'

import { Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError } from './validate-error'
import { ValidateContext } from './validate-context'

import validatorFrom, { ToValidator } from './validator-from'
import validatorMerge from './validator-merge'
import { assert } from 'console'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Settings ////

interface ValidatorSettings<I, O = I> {
    name: string
    error: string | ValidationErrorMessage<I>
    transform: ValidatorTransform<I, O>
    is: O extends I
        ? ValidatorTypeGuard<I, O> | ValidatorPredicate<I>
        : ValidatorPredicate<I>
    id?: symbol
}

type AnyValidatorSettings = Partial<ValidatorSettings<unknown,unknown>>

//// Setting Methods ////

type ValidatorTypeGuard<I, O extends I = I> = (input: I, ctx: ValidateContext<I>) => input is O
type ValidatorPredicate<I> = ParamTransform<I, boolean, [ValidateContext<I>]>
type ValidatorTransform<I, O = I> = ParamTransform<I, I | O, [ValidateContext<I>]>

//// Validator Type ////

interface Validator<I, O = I> extends Validate<I,O>, ValidatorSettings<I,O>, Struct {}

interface ValidatorConstructor {
    from: typeof validatorFrom
    merge: typeof validatorMerge

    new <I, O extends I>(settings: ValidatorSettings<I,O>): Validator<I,O>
    new <S extends AnyValidatorSettings>(settings: S): ToValidator<S>
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

            const isValid = this.is(output, ctx)
            if (!isValid)
                throw new ValidationError(this, ctx)

            return output
        })

    return output as O
}

//// Main ////

const Validator = class <I, O extends I = I> extends Validate<I, O> {

    static from = validatorFrom

    static merge = validatorMerge

    constructor(
        { name, error, id, ...overrides }: Partial<ValidatorSettings<I,O>>
    ) {

        super(validate)
        this.name = name ?? this.constructor.name
        this.error = error ?? 'Validation failed.'

        if (id)
            this.id = id

        merge(this, overrides)
    }

    override readonly name: string
    readonly error: string | ValidationErrorMessage<I>
    readonly id?: symbol
    
    is(input: I, ctx: ValidateContext<I>): input is O {
        return equals(input, ctx.transformed)
    }

    // assert(input: I, options?: ValidateOptions): asserts input is O {
    //     return
    // }

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
    ValidatorPredicate,
    ValidatorTypeGuard,
    ValidatorTransform,

    AnyValidatorSettings

}