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
    | SchemaProperties<O, O, any>
    | Validate<O, O>
    | object | string | number | boolean | bigint | symbol | Func | nil

type _SubValidatorSettings<T extends object> = Infer<{
    [K in _SchemaSettingKeys<T>]: T[K] extends AnyValidate
        ? Partial<_SubValidatorSettings<T[K]>> | nil | string | boolean
        : T[K]
}>

type _ApplySubValidatorSettings<V extends AnyValidate | AnySchema | SubValidatorConstructor> = 
    Partial<
    _SubValidatorSettings<V extends Schema<any,any,infer Tx> 
        ? Tx 
        : V extends SubValidatorConstructor<any, infer Vx>
            ? Vx
            : V
    >
    >

type _ApplySubValidatorInput<V extends AnyValidate | AnySchema | SubValidatorConstructor> = 
    V extends SubValidatorConstructor<infer A, any> 
        ? A
        : [enabled?: boolean] 
        | [update: ((update: V) => V)] 
        | [error: string]
        | [settings: _ApplySubValidatorSettings<V>]

//// Settings Types ////

export type SubValidatorConstructor<A extends unknown[] = any[], R extends AnyValidator = AnyValidator> = 
    (new (...args: A) => R)

/**
 * Helper type for keeping Schema return types clean on explicitly declared schemas.
 */
export interface ApplySubValiator<V extends AnyValidate | AnySchema | SubValidatorConstructor, R extends AnySchema> {
    (...input: _ApplySubValidatorInput<V>): R
}

export type SchemaSettingsInput<O> = { [key: string]: _SchemaSettingInput<O> }

export type SchemaSettingsOutput<T extends object> = Infer<{
    [K in _SchemaSettingKeys<T>]: T[K] extends AnyValidate | AnySchema
        ? SchemaSettingsOutput<T[K]> | nil
        : T[K] extends SubValidatorConstructor<any, infer V> 
            ? SchemaSettingsOutput<V> | nil
            : K extends KeysOf<AnyValidatorSettings>
                ? T extends ValidatorSettings<infer I, infer O> 
                    ? Exclude<ValidatorSettings<I,O>[K], nil>
                    : T[K]
                : T[K]
}>

export type SchemaMainValidator<I,O,T extends SchemaSettingsInput<O> | ValidatorSettings<I,O>> = 
    Validate<I,O> & T

//// Schema Types ////

export type AnySchema = SchemaProperties<any,any,any>

export interface SchemaProperties<I, O, T extends SchemaSettingsInput<O> | ValidatorSettings<I,O>> extends 
    Validate<I,O>, Struct, Iterable<Validate<unknown>>{
    
    get settings() : SchemaSettingsOutput<T>

    readonly validate: ValidatorPipe<I,O>

    get name(): string 

    //// Validation Interface ////
    
    validates(
        input: Partial<ValidatorSettings<O,O>> | Validate<O>,
        id?: symbol
    ): this 

    asserts(
        isValid: ValidatorPredicate<O>,
        id?: symbol
    ): this 
    asserts(
        isValid: ValidatorPredicate<O>,
        error?: ValidationErrorInput<O>,
        id?: symbol
    ): this 

    transforms(
        transform: ValidatorTransform<O>,
        id?: symbol
    ): this 
    transforms(
        transform: ValidatorTransform<O>,
        error?: ValidationErrorInput<O>,
        id?: symbol
    ): this 

    //// Apply ////
    
    apply(settings: Partial<SchemaSettingsOutput<T>>): this

    //// Iteration ////
    
    get validators(): [mainValidator: SchemaMainValidator<I,O,T>, ...genericValidators: Validate<O,O>[]]

}

export type SchemaSetters<I,O,T extends SchemaSettingsInput<O> | ValidatorSettings<I,O>> = {
    [K in _SchemaSettingKeys<T> as K extends 'name' ? 'named' : K]: 
    T[K] extends SubValidatorConstructor<infer A>
    
        ? (...args: A) => Schema<I,O,T>
        : T[K] extends AnySchema | AnyValidator
            ? (...args: _ApplySubValidatorInput<T[K]>) => Schema<I,O,T>
            : (input: T[K]) => Schema<I,O,T>
}

//// Schema Constructor Types ////

export type ToSchemaSettings<I ,O, T extends object> = Infer<{
    [K in _SchemaSettingKeys<T>]: 
    // is a standard validator setting
    K extends KeysOf<AnyValidatorSettings>
        // required standard validator setting
        ? Exclude<ValidatorSettings<I,O>[K], nil>

        // is validator 
        : T[K] extends Validator<infer Ix, any> | SchemaProperties<infer Ix, any, any> | SubValidatorConstructor<any, Validator<infer Ix,any>>
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
    new <I, O, T extends ValidatorSettings<I,O>>(settings: T): Schema<I, O, T>

}
