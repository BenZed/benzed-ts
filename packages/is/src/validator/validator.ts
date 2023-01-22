
import { equals } from '@benzed/immutable'
import { ParamTransform, applyResolver, isFunc, Property, Pipe, merge, Infer } from '@benzed/util'

import { AnyValidate, Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError } from './error'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

interface ValidatorContext<T> extends Required<ValidateOptions> {
    readonly input: T
    transformed?: T
}

type ValidatorTypeGuard<I, O extends I = I> = (input: I, ctx: ValidatorContext<I>) => input is O

type ValidatorPredicate<I> = ParamTransform<I, boolean, [ValidatorContext<I>]>

type ValidatorTransform<I, O extends I = I> = ParamTransform<I, I | O, [ValidatorContext<I>]>

interface ValidatorSettings<I, O extends I = I> {
    name: string
    is: ValidatorTypeGuard<I, O> | ValidatorPredicate<I>
    error: string | ValidationErrorMessage<I>
    transform: ValidatorTransform<I, O>
    id?: symbol
}

type AnyValidatorSettings = Partial<ValidatorSettings<unknown,unknown>>

type ValidatorAdditional<A extends AnyValidatorSettings> = Infer<{
    [K in Exclude<keyof A, keyof AnyValidatorSettings>]: A[K]
}>

type ToValidator<A extends AnyValidatorSettings> = 
   A extends

   { is: ValidatorTypeGuard<infer I, infer O> } | { transform: ValidatorTransform<infer I, infer O> } 

       ? Validator<I, O> & ValidatorAdditional<A> 
       : never

//// Defaults ////

function createValidatorContext <I>(input: I, options?: ValidateOptions): ValidatorContext<I> {

    const ctx = { 
        transform: true, 
        path: [],
        input,
        ...options 
    }

    return ctx
}

function validate<I, O extends I>(this: Validator<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = createValidatorContext(input, options)

    const output = applyResolver(
        this.transform(ctx.input, ctx), 
        transformed => {

            const output = ctx.transform 
                ? transformed
                : ctx.input

            const isValid = this.is(output, { ...ctx, transformed })
            if (!isValid)
                ValidationError.throw(this.error, ctx)

            return output
        })

    return output as O
}

//// Main ////

class Validator<I, O extends I = I> extends Validate<I, O> implements ValidatorSettings<I,O> {

    static create<Ix, Ox extends Ix = Ix>(settings: Partial<ValidatorSettings<Ix,Ox>>): Validator<Ix,Ox>
    static create<S extends AnyValidatorSettings>(settings: S): ToValidator<S>
    static create({ name, error, id, ...settings }: ValidatorSettings<unknown>): AnyValidate {
        const validator = new Validator(name, error, id)
        return merge(validator, settings)
    }

    static merge(...input: (AnyValidate | Partial<ValidatorSettings<unknown>>)[]): AnyValidate {

        const validators = input.map(v => isFunc(v) ? v : Validator.create(v))
        const validator = validators.length === 1 
            ? validators[0] 
            : Pipe.from( ...validators )

        if (validators.length > 1) {
            const name = (validators[0].name ?? 'validate').replaceAll('-merged', '')
            Property.name(validator, name + '-merged')
        }

        return validator
    }

    is(input: I, ctx: ValidatorContext<I>): input is O {
        return equals(input, ctx.transformed)
    }

    transform(input: I, ctx: ValidatorContext<I>): I | O {
        ctx.transformed = input
        return input
    }
    
    private constructor(
        override readonly name: string = Validator.constructor.name,
        readonly error: string | ValidationErrorMessage<I> = 'Validation failed.',
        readonly id?: symbol
    ) {
        super(validate)
    }

}

//// Exports ////

export default Validator 

export {
    Validator,
    ValidatorSettings,
    ValidatorPredicate,
    ValidatorTypeGuard,
    ValidatorTransform,

    ValidatorContext,
    createValidatorContext,

    AnyValidatorSettings,
    ToValidator

}