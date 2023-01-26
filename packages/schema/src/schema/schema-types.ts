import { Struct } from '@benzed/immutable'
import { Func, Infer, Invalid, KeysOf, nil } from '@benzed/util'

import { 
    AnyValidate, 
    AnyValidator, 
    AnyValidatorSettings, 
    ToValidator, 
    Validate, 
    ValidateInput, 
    ValidationErrorInput, 
    Validator, 
    ValidatorPredicate, 
    ValidatorSettings, 
    ValidatorTransform, 
    VALIDATOR_DISALLOWED_SETTINGS_KEYS 
} from '../validator'

import Schema, { ValidatorPipe } from './schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Settings Types ////

const SCHEMA_DISALLOWED_SETTINGS = [ 
    ...VALIDATOR_DISALLOWED_SETTINGS_KEYS,
    'transforms',
    'asserts',
    'validates',
    'validators',
    'apply',
    'settings'
] as const

type _SchemaDisallowedSettingKeys = typeof SCHEMA_DISALLOWED_SETTINGS[number]

type _SchemaSettingKeys<T> = Exclude<KeysOf<T>, _SchemaDisallowedSettingKeys>

type _SchemaSettingInput<O> = 
    SchemaProperties<O, O, any> | Validate<O, O> | object | string | number | boolean | bigint | symbol | Func

type _SchemaSubSettings<T extends object> = Infer<{
    [K in _SchemaSettingKeys<T>]: T[K] extends AnyValidate
        ? Partial<_SchemaSubSettings<T[K]>> | nil | string | boolean
        : T[K]
}>

type _ValidatorSetter<I,O,T extends SchemaSettingsInput<O>,V extends AnyValidate> = 
/**/ (input?: 
/**/ string | // error shorthand
/**/ boolean | // enabled shorthand
/**/ ((update: V) => V) | // update method shorthand 
/**/ Partial<_SchemaSubSettings<V>> // explicit options
/**/ ) => Schema<I,O,T>

type _SchemaSetter<I, O, T extends SchemaSettingsInput<O>, S extends AnySchema> = 
    S extends Schema<any,any,infer Tx>
        ? Infer<
        /**/ (input?: 
        /**/ boolean | // enabled shorthand
        /**/ string | // error shorthand
        /**/ Partial<_SchemaSubSettings<Tx>> | // explicit options
        /**/ ((update: S) => S) // update method
        /**/ ) => Schema<I,O,T>>
        : S

type _OptionSetter<I,O,T extends SchemaSettingsInput<O>, V> = (input: V) => Schema<I,O,T>

//// Settings Types ////

export type SchemaSettingsInput<O> = Record<string, _SchemaSettingInput<O>>

export type SchemaSettingsOutput<T extends object> = Infer<{
    [K in _SchemaSettingKeys<T>]: T[K] extends AnyValidate | AnySchema
        ? SchemaSettingsOutput<T[K]> | nil
        : K extends KeysOf<AnyValidatorSettings>
            ? T extends ValidatorSettings<infer I, infer O> 
                ? Exclude<ValidatorSettings<I,O>[K], nil>
                : T[K]
            : T[K]
}>

export type SchemaMainValidator<I,O,T extends SchemaSettingsInput<O>> = Validate<I,O> & T

//// Schema Types ////

export type AnySchema = SchemaProperties<any,any,any>

export interface SchemaProperties<I, O, T extends SchemaSettingsInput<O>> extends Validate<I,O>, Struct, Iterable<Validate<unknown>>{
    
    get settings() : SchemaSettingsOutput<T>

    readonly validate: ValidatorPipe<I,O>

    get name(): string 

    //// Validation Interface ////
    
    validates(
        input: Partial<ValidatorSettings<O,O>> | Validate<O>
    ): this 

    asserts(
        isValid: ValidatorPredicate<O>,
        error?: ValidationErrorInput<O>
    ): this 

    transforms(
        transform: ValidatorTransform<O>,
        error?: ValidationErrorInput<O>
    ): this 

    //// Apply ////
    
    apply(settings: Partial<SchemaSettingsOutput<T>>): this

    //// Iteration ////
    
    get validators(): [mainValidator: SchemaMainValidator<I,O,T>, ...genericValidators: Validate<O,O>[]]

}

export type SchemaSetters<I,O,T extends SchemaSettingsInput<O>> = {
    [K in _SchemaSettingKeys<T> as K extends 'name' ? 'named' : K]: T[K] extends AnySchema
        ? _SchemaSetter<I,O,T,T[K]>
        : T[K] extends AnyValidator
            ? _ValidatorSetter<I,O,T,T[K]>
            : _OptionSetter<I,O,T,T[K]>
}

//// Schema Constructor Types ////

export type ToSchemaSettings<I ,O, T extends object> = Infer<{
    [K in _SchemaSettingKeys<T>]: 
    // is a standard validator setting
    K extends KeysOf<AnyValidatorSettings>
        // required standard validator setting
        ? Exclude<ValidatorSettings<I,O>[K], nil>

        // is validator 
        : T[K] extends Validator<infer Ix, any> | SchemaProperties<infer Ix, any, any>
            // output matches input
            ? Ix extends O 
                ? T[K]

                // TODO make a real error
                : Invalid<{ 'subvalidator-invalid-input-type': ValidateInput<Infer<T[K], AnyValidate>> }>
            
            // is whatever else
            : T[K]
}, SchemaSettingsInput<O>>

export type ToSchema<T extends AnyValidate | AnyValidatorSettings> = T extends Validate<infer I, infer O> 
    ? Schema<I, O, ToSchemaSettings<I, O, T>>
    : T extends AnyValidatorSettings
        ? ToValidator<T> extends Validate<infer I, infer O>
            ? Schema<I, O, ToSchemaSettings<I, O, T>>
            : never
        : never 

export interface SchemaConstructor {

    new <V extends AnyValidate | AnyValidatorSettings>(validate: V): ToSchema<V>
    new <I,O,T extends SchemaSettingsInput<O>>(settings: T): Schema<I,O,T>

}
