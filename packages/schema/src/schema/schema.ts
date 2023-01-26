
// import { isFunc, Pipe } from '@benzed/util'

// import {
//     AnyValidate,
//     AnyValidatorSettings,
//     ToValidator,
//     Validate,
//     ValidationErrorInput,
//     Validator,
//     ValidatorPredicate,
//     ValidatorSettings,
//     ValidatorTransform,
// } from '../validator'
  
// import { SchemaCursor, SchemaSetters, AnySchemaSettings, ToSchema } from './schema-cursor'

// //// EsLint ////

// /* eslint-disable 
//     @typescript-eslint/no-explicit-any,
//     @typescript-eslint/ban-types
// */

// //// Types ////

// interface SchemaProperties<I,O> extends Validate<I,O> {

//     validates<T extends Partial<ValidatorSettings<O, O>>>(settings: T): this
//     validates(validate: ValidatorPredicate<I>): this

//     asserts(
//         isValid: ValidatorPredicate<O>,
//         error?: ValidationErrorInput<I>,
//         id?: symbol
//     ): this 

//     transforms(
//         transform: ValidatorTransform<O>,
//         error?: ValidationErrorInput<I>, 
//         id?: symbol
//     ): this
    
// }

// type Schema<I, O, T extends AnySchemaSettings> = SchemaCursor<I, O, T> & SchemaProperties<I,O> & SchemaSetters<I, O, T>

// type AnySchema = Schema<unknown, unknown, AnySchemaSettings>

// //// SchemaCursor ////

// interface SchemaConstructor {

//     new <V extends AnyValidate | AnySchemaSettings>(validate: V): ToSchema<V>

// }

// //// Main ////

// const Schema = class extends SchemaCursor<unknown,unknown, AnySchemaSettings> {

//     //// Instance ////

//     constructor(settings: AnySchemaSettings) {
//         super(settings)
//     }

//     validates(
//         input: Partial<AnyValidatorSettings> | AnyValidate
//     ): this {
//         let validate = isFunc(input) ? input : Validator.from(input)
        
//         validate = Pipe.from(
//             Validator.merge(...this.validators as [AnyValidate], validate)
//         )

//         return Validator.apply(this, { validate })
//     }

//     asserts(
//         isValid: ValidatorPredicate<unknown>,
//         error?: ValidationErrorInput<unknown>
//     ): this {
//         return this.validates({
//             isValid,
//             error
//         })
//     }

//     transforms(
//         transform: ValidatorTransform<unknown>,
//         error?: ValidationErrorInput<unknown>
//     ): this {
//         return this.validates({
//             transform,
//             error
//         })
//     }

// } as unknown as SchemaConstructor

// //// Exports ////

// export default Schema 

// export {
//     Schema,
//     AnySchema
// }