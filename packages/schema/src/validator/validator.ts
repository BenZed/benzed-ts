
import { equals, Struct } from '@benzed/immutable'
import {
    ParamTransform, 
    applyResolver, 
    isFunc, Property, 
    Pipe, 
    merge, 
    Infer 
} from '@benzed/util'

import { AnyValidate, Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError } from './error'
import { ValidateContext } from './context'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type ValidatorTypeGuard<I, O extends I = I> = (input: I, ctx: ValidateContext<I>) => input is O
type ValidatorPredicate<I> = ParamTransform<I, boolean, [ValidateContext<I>]>
type ValidatorTransform<I, O = I> = ParamTransform<I, I | O, [ValidateContext<I>]>

interface ValidatorSettings<I, O = I> {
    name: string
    is: O extends I 
        ? ValidatorTypeGuard<I, O> | ValidatorPredicate<I>
        : ValidatorPredicate<I>
    error: string | ValidationErrorMessage<I>
    transform: ValidatorTransform<I, O>
    id?: symbol
}

type AnyValidatorSettings = Partial<ValidatorSettings<unknown,unknown>>

interface Validator<I, O = I> extends Validate<I,O>, ValidatorSettings<I,O>, Struct {}

type ToValidator<A extends AnyValidatorSettings> = 
   A extends

   { is: ValidatorTypeGuard<infer I, infer O> } | { transform: ValidatorTransform<infer I, infer O> } 

       ? Validator<I, O> & ValidatorOverrides<A> 
       : never

type ValidatorOverrides<A extends AnyValidatorSettings> = Infer<{
    [K in Exclude<keyof A, keyof AnyValidatorSettings>]: A[K]
}>

type Mergable<I, O> = Validate<I,O> | ValidatorSettings<I, O> 
type Merge<I, O> = [
    Mergable<I, O>
] | [
    Mergable<I,unknown>,
    ...Mergable<unknown,unknown>[],
    Mergable<unknown,O>
]
interface ValidatorConstructor {

    from<V extends AnyValidate | AnyValidatorSettings>(
        settings: AnyValidate | AnyValidatorSettings
    ): V extends AnyValidatorSettings 
        ? ToValidator<V>
        : V

    merge(...validators: Merge<unknown, unknown>): Validate<unknown, unknown>
    merge<I, O>(...validators: Validate<I,O>[]): Validate<I, O>

    new <I, O extends I>(settings: ValidatorSettings<I,O>): Validator<I,O>
    new <S extends AnyValidatorSettings>(settings: S): ToValidator<S>
}

//// Defaults ////

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

    static from<V extends AnyValidate | AnyValidatorSettings>(settings: V): V extends AnyValidatorSettings 
        ? ToValidator<V>
        : V {
        return isFunc(settings) ? settings : new Validator(settings) as any
    }

    static merge<I, O>(...input: Merge<I,O>): Validate<I,O> {

        const validators = input.map(v => isFunc<Validate<unknown>>(v) ? v: new Validator(v as ValidatorSettings<unknown>))
        const validate = validators.length === 1 
            ? validators[0] 
            : Pipe.from( ...validators)

        if (validators.length > 1) {
            const name = (validators[0].name ?? 'validate').replaceAll('-merged', '')
            Property.name(validate, name + '-merged')
        }

        return validate as Validate<I, O>
    }

    is(input: I, ctx: ValidateContext<I>): input is O {
        return equals(input, ctx.transformed)
    }

    transform(input: I, ctx: ValidateContext<I>): I | O {
        ctx.transformed = input
        return input
    }

    override readonly name: string
    readonly error: string | ValidationErrorMessage<I>
    readonly id?: symbol
    
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

} as ValidatorConstructor

//// Exports ////

export default Validator 

export {
    Validator,
    ValidatorSettings,
    ValidatorPredicate,
    ValidatorTypeGuard,
    ValidatorTransform,

    ValidatorOverrides,
    AnyValidatorSettings

}