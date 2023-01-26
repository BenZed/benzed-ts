// import { copy, Struct } from '@benzed/immutable'

// import {
//     merge,
//     nil,
//     ParamPipe,
//     KeysOf,
//     Pipe,
//     keysOf,
//     defined,
//     Infer,
//     omit,
//     doWith,
// } from '@benzed/util'
 
// import {
//     AnyValidate,
//     AnyValidatorSettings,
//     Validate,
//     ValidateContext,
//     ValidateOptions,
//     ValidationErrorInput,
//     Validator,
//     ValidatorSettings,
// } from '../validator'

// import ensureAccessors, { DISALLOWED_KEYS, getSettingsValidator } from './ensure-setters'

// import type { AnySchema, Schema } from './schema'

// //// EsLint ////

// /* eslint-disable 
//     @typescript-eslint/no-explicit-any,
//     @typescript-eslint/ban-types
// */

// //// Helper Types ////

// type _DISALLOWED_KEYS = never

// type _ValidatorSettingKeys = KeysOf<ValidatorSettings<unknown,unknown>>

//     type _NameToNamed<O extends object> = 'name' extends keyof O 
//         ? 'named' 
//         : never

// type _SchemaSetterKeys<O extends object> = 
//     | Exclude<KeysOf<O>, _DISALLOWED_KEYS | 'name'> 
//     | _NameToNamed<O>

// type _SchemaSubValidateOptions<V extends AnyValidate> = Infer<{
//     [K in Exclude<KeysOf<V>, _DISALLOWED_KEYS | 'name'>]: V[K]
// }>

// type _SchemaSubValidateSetter<V extends AnyValidate, I, O, T extends AnyValidatorSettings> = 
//     (
//         errorSettingsOrEnabled?: ValidationErrorInput<I> | boolean | Partial<_SchemaSubValidateOptions<V>>
//     ) => Schema<I, O, T>

// type _SchemaSettingKeys<O extends object> = Exclude<KeysOf<O>, _DISALLOWED_KEYS>

// //// Types ////

// type ValidatorPipe<I, O> = ParamPipe<I, O, [Partial<ValidateOptions> | nil]>

// type AnyValidatorPipe = ValidatorPipe<any, any>

// type AnySchemaSettings = AnyValidatorSettings

// interface SchemaCursorProperties<I, O, T extends AnyValidatorSettings> extends Validate<I, O>, Struct, Iterable<AnyValidate> {

//     // readonly settings: T

//     apply(settings: Partial<T>): this

//     readonly validate: ValidatorPipe<I, O>
//     get validators(): AnyValidate[]

// }

// type SchemaSetters<I, O, T extends AnyValidatorSettings> = {
//     [K in _SchemaSetterKeys<T>]: K extends 'named'

//         ? (input: string) => Schema<I, O, T>
//         : T[K] extends AnyValidate
//             ? _SchemaSubValidateSetter<T[K], I, O, T>
//             : K extends keyof T 
//                 ? (input: T[K]) => Schema<I, O, T>
//                 : never
// }

// type ToSchema<V extends AnyValidate | AnySchemaSettings> = V extends Validate<infer I, infer O> 
//     ? Schema<I, O, ToSchemaSettings<I, V>>
//     : V extends AnySchemaSettings
//         ? ToValidator<V> extends Validate<infer I, infer O>
//             ? Schema<I, O, ToSchemaSettings<I, V>>
//             : never
//         : never 

// type ToSchemaSettings<I, O extends object> = Infer<{ 
//     [K in _SchemaSettingKeys<O>]: K extends _ValidatorSettingKeys 
//         ? ValidatorSettings<I>[K]
//         : O[K]
// }, AnySchemaSettings>

// //// Implementation ////

// function schemaValidator <I,O>(this: { validate: Validate<I, O> }, i: I, options?: Partial<ValidateOptions>): O {
//     const ctx = new ValidateContext(i, options)
//     return this.validate(i, ctx)
// }

// //// Main ////

// abstract class SchemaCursor<I, O, T extends AnySchemaSettings> extends Validate<I, O> implements SchemaCursorProperties<I, O, T> {

//     //// Instance ////

//     constructor(settings: T) {
//         super(schemaValidator)

//         const validator = Validator.from(settings) as Validate<I, O>
//         this.validate = Pipe.from(validator)
//         ensureAccessors(this, settings)
//     }

//     readonly validate: ValidatorPipe<I, O>

//     //// Iteration ////

//     get validators(): AnyValidate[] {
//         return Array.from(this)
//     }
    
//     *[Symbol.iterator](): IterableIterator<AnyValidate> {
//         yield* (this as unknown as AnySchema).validate.transforms
//     }

//     //// Settings ////

//     get settings(): T {
//         const settings = getSettingsValidator(this)
//         return { ...settings }
//     }

//     override get name(): string {
//         return getSettingsValidator(this).name
//     }

//     override apply(settings: T): this {
//         return Validator.apply(this, settings)
//     }
    
// } 

// //// Exports ////

// export default SchemaCursor 

// export {

//     SchemaCursor,
//     SchemaSetters,
//     ToSchema,
//     ToSchemaSettings,

//     ValidatorPipe,
//     AnyValidatorPipe,
//     AnySchemaSettings
// }