
import { CallableStruct, StructAssignState, equals } from '@benzed/immutable'
import { Empty, Func, Infer, KeysOf, omit, ParamTransform, Property, Resolver } from '@benzed/util'

import ValidateContext from './validate-context'
import { AnyValidate, Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError, ValidationErrorInput } from './validate-error'
import validatorFrom from './validator-from'
import validatorMerge from './validator-merge'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _ValidatorFromSettings<S extends AnyValidatorSettings> = 
    Infer<Validator< SettingsInput<S>, SettingsOutput<S>>>
    
type _ExtraSettings<S extends AnyValidatorSettings> = Infer<{
    [K in Exclude<KeysOf<S>, KeysOf<AnyValidatorSettings>>]: S[K]
}, object>

type _InferSettingThisContext<S extends AnyValidatorSettings> = {
    [K in keyof S]: S[K] extends Func
        ? (this: S, ...args: Parameters<S[K]>) => ReturnType<S[K]>
        : S[K]
}

//// Settings Types ////

type ValidatorSettings<I, O> = {
    name?: string
    error?: ValidationErrorInput<I>
    isValid?: O extends I 
        ? ValidatorPredicate<I> | ValidatorTypeGuard<I,O>
        : ValidatorPredicate<I> 
    transform?: ValidatorTransform<I, O>
}
type SettingsInput<S extends AnyValidatorSettings> = S extends ValidatorSettings<infer I, any> ? I : unknown
type SettingsOutput<S extends AnyValidatorSettings> = S extends ValidatorSettings<infer I, infer O> 
    ? unknown extends O 
        ? I 
        : O 
    : unknown

type AnyValidatorSettings = ValidatorSettings<any,any>

//// Validator Types ////

interface Validator<I, O> extends Validate<I,O>, ValidatorSettings<I,O> {}

type ApplyableValidatorSettings<V extends AnyValidate> = Omit<StructAssignState<V>, 'transform' | 'isValid'>
type ValidatorPredicate<I> = ParamTransform<I, boolean, [ValidateContext<I>]>
type ValidatorTransform<I, O = I> = ParamTransform<I, I | O, [ValidateContext<I>]>
type ValidatorTypeGuard<I, O extends I = I> = (input: I, ctx: ValidateContext<I>) => input is O

//// Validator Constructor Types ////

type ToValidator<S extends AnyValidatorSettings> = 
    _ExtraSettings<S> extends Empty 
        ? _ValidatorFromSettings<S>
        : _ValidatorFromSettings<S> & _ExtraSettings<S>

interface ValidatorConstructor {

    apply<V extends AnyValidate>(
        validator: V, 
        settings: ApplyableValidatorSettings<V>
    ): V

    from: typeof validatorFrom

    merge: typeof validatorMerge

    new <S extends AnyValidatorSettings>(input: _InferSettingThisContext<S>): ToValidator<S>
    new <I, O extends I = I>(settings: ValidatorSettings<I,O>): Validator<I,O>

}

//// Validator Method ////

function validate<I, O extends I>(this: Required<ValidatorSettings<I,O>>, input: I, options?: Partial<ValidateOptions>): O {

    const ctx = new ValidateContext(input, options)

    const transformed = this.transform(input, ctx)

    return new Resolver(transformed)
        .then(resolved => {

            ctx.value = resolved as I

            const output = ctx.transform 
                ? ctx.value
                : input

            if (!this.isValid(output, ctx))
                throw new ValidationError(this, ctx)

            return output
        })
        .value as O

}

//// Implementation ////

const Validator = class extends CallableStruct<Validate<unknown>> {

    static from = validatorFrom
    static merge = validatorMerge

    constructor(
        { name, error, ...settings }: Partial<ValidatorSettings<unknown,unknown>>
    ) {

        super(validate)
        this.name = name ?? this.constructor.name
        this.error = error ?? (this.name === this.constructor.name 
            ? 'Validation failed.'
            : `Must be ${this.name}.`)

        Property.transpose(settings, this)
    }

    override [CallableStruct.$$assign](state: StructAssignState<this>): StructAssignState<this> {
        return omit(state, 'isValid', 'transform')
    }

    override readonly name: string
    readonly error: string | ValidationErrorMessage<unknown>
    
    isValid(input: unknown, ctx: ValidateContext<unknown>): input is unknown {
        return equals(input, ctx.value)
    }

    transform(input: unknown, _ctx: ValidateContext<unknown>): unknown | unknown {
        return input
    }

} as ValidatorConstructor

//// Exports ////

export default Validator

export {
    Validator,
    ValidatorPredicate,
    ValidatorTransform,
    ValidatorTypeGuard,
    ValidatorSettings,

    ApplyableValidatorSettings,
    AnyValidatorSettings,
    ToValidator

}