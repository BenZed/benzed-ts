
import { CallableStruct,StructAssignState } from '@benzed/immutable'
import { defined, Empty, Infer, KeysOf, omit, ParamTransform, Property } from '@benzed/util'

import { AbstractValidator } from './abstract'

import Validate, { AnyValidate } from './validate'
import ValidateContext from './validate-context'
import { ValidationErrorInput } from './validate-error'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

const VALIDATOR_DISALLOWED_SETTINGS_KEYS = ['isValid', 'transform', 'id'] as const
type ValidatorDisallowedSettingsKeys = typeof VALIDATOR_DISALLOWED_SETTINGS_KEYS[number]

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

interface Validator<I, O = I> extends Validate<I,O>, Omit<AbstractValidator<I, O>, 'isValid' | 'name'> {
    name: string
    isValid(input: I, ctx: ValidateContext<I>): boolean
}

type AnyValidator = Validator<any,any>

type AllowedValidatorSettings<T extends object> = Omit<Partial<T>, ValidatorDisallowedSettingsKeys>

type ValidatorTransform<I, O = I> = ParamTransform<I, I | O, [ctx: ValidateContext<I>]>
type ValidatorTypeGuard<I, O extends I = I> = (input: I, ctx: ValidateContext<I>) => input is O
type ValidatorPredicate<I> = ParamTransform<I, boolean, [ctx: ValidateContext<I>]>

//// Validator Constructor Types ////

type ToValidatorInput = Record<string, unknown>

type ToValidator<S extends AnyValidatorSettings> = 
    _ValidatorSettingExtensions<S> extends Empty 
        ? _ValidatorFromSettings<S>
        : _ValidatorFromSettings<S> & _ValidatorSettingExtensions<S>

interface ValidatorConstructor extends Omit<typeof AbstractValidator, 'apply'> {

    apply<V extends AnyValidate>(
        validator: V, 
        settings: AllowedValidatorSettings<V>
    ): V

    new <S extends ToValidatorInput>(input: S): ToValidator<S>
    new <I, O extends I = I>(settings: ValidatorSettings<I,O>): Validator<I,O>

}

//// Implementation ////

const Validator = class extends AbstractValidator<unknown, unknown> {

    constructor(
        { id, ...settings }: Partial<ValidatorSettings<unknown,unknown>>
    ) {

        super(id)

        Property.transpose(defined(settings), this)
        // ensure error is counted as state if it wasn't provided
        Property.configure(this, 'error', { enumerable: true })
    }

    override [CallableStruct.$$assign](state: StructAssignState<this>): StructAssignState<this> {
        return omit(state, ...VALIDATOR_DISALLOWED_SETTINGS_KEYS)
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

    VALIDATOR_DISALLOWED_SETTINGS_KEYS,
}