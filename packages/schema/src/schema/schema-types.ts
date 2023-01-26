import { Struct } from '@benzed/immutable'

import {
    nil,
    ParamPipe,
    KeysOf,
    Infer,
} from '@benzed/util'
 
import {
    AnyValidate,
    AnyValidatorSettings,
    Validate,
    ValidateOptions,
    ValidationErrorInput,
    ValidatorPredicate,
    ValidatorSettings,
    ValidatorTransform,
} from '../validator'

import SchemaCursor from './schema-cursor'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _DISALLOWED_KEYS = never

type _ValidatorSettingKeys = KeysOf<ValidatorSettings<unknown,unknown>>

    type _NameToNamed<O extends object> = 'name' extends keyof O 
        ? 'named' 
        : never

type _SchemaSetterKeys<O extends object> = 
    | Exclude<KeysOf<O>, _DISALLOWED_KEYS | 'name'> 
    | _NameToNamed<O>

type _SchemaSubValidateOptions<V extends AnyValidate> = Infer<{
    [K in Exclude<KeysOf<V>, _DISALLOWED_KEYS | 'name'>]: V[K]
}>

type _SchemaSubValidateSetter<V extends AnyValidate, I, O, T extends AnyValidatorSettings> = 
    (
        errorSettingsOrEnabled?: ValidationErrorInput<I> | boolean | Partial<_SchemaSubValidateOptions<V>>
    ) => Schema<I, O, T>

type _SchemaSettingKeys<O extends object> = Exclude<KeysOf<O>, _DISALLOWED_KEYS>

//// Types ////

type ValidatorPipe<I, O> = ParamPipe<I, O, [Partial<ValidateOptions> | nil]>

type AnyValidatorPipe = ValidatorPipe<any, any>

type AnySchemaSettings = AnyValidatorSettings

interface SchemaCursorProperties<I, O, T extends AnyValidatorSettings> extends Validate<I, O>, Struct, Iterable<AnyValidate> {

    readonly settings: T

    apply(settings: Partial<T>): this

    readonly validate: ValidatorPipe<I, O>
    get validators(): AnyValidate[]

}

type SchemaSetters<I, O, T extends AnyValidatorSettings> = {
    [K in _SchemaSetterKeys<T>]: K extends 'named'

        ? (input: string) => Schema<I, O, T>
        : T[K] extends AnyValidate
            ? _SchemaSubValidateSetter<T[K], I, O, T>
            : K extends keyof T 
                ? (input: T[K]) => Schema<I, O, T>
                : never
}

type ToSchema<V extends AnyValidate | AnySchemaSettings> = V extends Validate<infer I, infer O> 
    ? Schema<I, O, ToSchemaSettings<I, V>>
    : V extends AnySchemaSettings
        ? ToValidator<V> extends Validate<infer I, infer O>
            ? Schema<I, O, ToSchemaSettings<I, V>>
            : never
        : never 

type ToSchemaSettings<I, O extends object> = Infer<{ 
    [K in _SchemaSettingKeys<O>]: K extends _ValidatorSettingKeys 
        ? ValidatorSettings<I>[K]
        : O[K]
}, AnySchemaSettings>

//// Types ////

interface SchemaProperties<I,O> extends Validate<I,O> {

    validates<T extends Partial<ValidatorSettings<O, O>>>(settings: T): this
    validates(validate: ValidatorPredicate<I>): this

    asserts(
        isValid: ValidatorPredicate<O>,
        error?: ValidationErrorInput<I>,
        id?: symbol
    ): this 

    transforms(
        transform: ValidatorTransform<O>,
        error?: ValidationErrorInput<I>, 
        id?: symbol
    ): this
    
}

type Schema<I, O, T extends AnySchemaSettings> = SchemaCursor<I, O, T> & SchemaProperties<I,O> & SchemaSetters<I, O, T>

type AnySchema = Schema<unknown, unknown, AnySchemaSettings>

//// SchemaConstructor ////

interface SchemaConstructor {

    new <V extends AnyValidate | AnySchemaSettings>(validate: V): ToSchema<V>

}
