
import { CallableStruct, StructAssignState, equals } from '@benzed/immutable'
import { Empty, Infer, KeysOf, omit, ParamTransform, Property, Resolver } from '@benzed/util'

import { AnyValidate, Validate, ValidateOptions, ValidateConstructor } from './validate'
import { ValidationError, ValidationErrorInput } from './validate-error'
import ValidateContext from './validate-context'
import validatorFrom from './validator-from'
import validatorMerge from './validator-merge'
import { $$id } from '../symbols'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

const VALIDATOR_DISALLOWED_SETTINGS_KEYS = ['isValid', 'transform', 'id'] as const
type _ValidatorDisallowedSettingsKeys = typeof VALIDATOR_DISALLOWED_SETTINGS_KEYS[number]

type _ValidatorFromSettings<S extends AnyValidatorSettings> = 
    Infer<Validator< ValidatorSettingsInput<S>, ValidatorSettingsOutput<S>>>

type _ValidatorSettingExtensions<S extends AnyValidatorSettings> = Infer<{
    [K in Exclude<KeysOf<S>, KeysOf<AnyValidatorSettings>>]: S[K]
}, object>

//// Settings Types ////

interface ValidatorSettings<I, O> {
    id?: symbol 
    name?: string
    error?: ValidationErrorInput<I>
    isValid?: O extends I 
        ? ValidatorPredicate<I> | ValidatorTypeGuard<I,O>
        : ValidatorPredicate<I> 
    transform?: ValidatorTransform<I, O>
}

type ValidatorSettingsInput<S extends AnyValidatorSettings> = S extends ValidatorSettings<infer I, any> ? I : unknown
type ValidatorSettingsOutput<S extends AnyValidatorSettings> = S extends ValidatorSettings<infer I, infer O> 
    ? unknown extends O 
        ? I 
        : O 
    : unknown

type AnyValidatorSettings = ValidatorSettings<any,any>

//// Validator Types ////

interface Validator<I, O = I> extends Validate<I,O> {
    name: string
    error(): string
    isValid(input: I, ctx: ValidateContext<I>): boolean
    transform(input: I, ctx: ValidateContext<I>): O | I
}

type AnyValidator = Validator<any,any>

type AllowedValidatorSettings<T extends object> = Omit<StructAssignState<T>, _ValidatorDisallowedSettingsKeys>
type ValidatorPredicate<I> = ParamTransform<I, boolean, [ctx: ValidateContext<I>]>
type ValidatorTransform<I, O = I> = ParamTransform<I, I | O, [ctx: ValidateContext<I>]>
type ValidatorTypeGuard<I, O extends I = I> = (input: I, ctx: ValidateContext<I>) => input is O

//// Validator Constructor Types ////

type ToValidatorInput = Record<string, unknown>

type ToValidator<S extends AnyValidatorSettings> = 
    _ValidatorSettingExtensions<S> extends Empty 
        ? _ValidatorFromSettings<S>
        : _ValidatorFromSettings<S> & _ValidatorSettingExtensions<S>

interface ValidatorConstructor extends Omit<ValidateConstructor, 'apply'> {

    apply<V extends AnyValidate>(
        validator: V, 
        settings: AllowedValidatorSettings<V>
    ): V

    from: typeof validatorFrom
    merge: typeof validatorMerge

    new <S extends ToValidatorInput>(input: S): ToValidator<S>
    new <I, O extends I = I>(settings: ValidatorSettings<I,O>): Validator<I,O>

}

//// Validator Method ////

function validate<I, O>(this: Required<ValidatorSettings<I, O>>, input: I, options?: Partial<ValidateOptions>): O {

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

const Validator = class extends Validate<unknown, unknown> {

    static from = validatorFrom
    static merge = validatorMerge

    constructor(
        { name, id, ...settings }: Partial<ValidatorSettings<unknown,unknown>>
    ) {

        super(validate)
        this.name = name ?? this.constructor.name

        Property.transpose(settings, this)

        // ensure error is counted as state if it wasn't provided
        Property.configure(this, 'error', { enumerable: true })

        if (id)
            Property.configure(this, $$id, { value: id, enumerable: true })
    }

    override [CallableStruct.$$assign](state: StructAssignState<this>): StructAssignState<this> {
        return omit(state, 'isValid', 'transform')
    }

    override readonly name: string

    error(): string {
        return this.name === this.constructor.name 
            ? 'Validation failed.'
            : `Must be ${this.name}.`
    }
    
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
    ValidatorSettingsInput,
    ValidatorSettingsOutput,

    AllowedValidatorSettings,
    AnyValidatorSettings,
    AnyValidator,
    ToValidator,

    VALIDATOR_DISALLOWED_SETTINGS_KEYS

}