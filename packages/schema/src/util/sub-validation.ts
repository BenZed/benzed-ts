import { Callable } from '@benzed/util'

import { AnyValidate } from '../validator/validate'

import { AnySchema, resolveSubvalidatorId } from '../schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////  

type ValidateConstructor<V extends AnyValidate = AnyValidate> = new (...args: any) => V

//// Main ////

type SubSchema = Pick<AnySchema, 'validates' | 'removeValidator'>

type SubValidationSignature<V extends ValidateConstructor> = 
    | [enabled: false] 
    | ConstructorParameters<V>

interface SubValidatorConstructor {
    new <V extends ValidateConstructor, S extends SubSchema>(
        validateConstructor: V, 
        schema: S,
        id?: symbol
    ): SubValidation<SubValidationSignature<V>, S>
}

interface SubValidation<A extends any[], S extends SubSchema> {
    (this: S, ...args: A): S

    // TODO also add nested methods from SubValidator
    // TODO also allow Validator/Schema instances in addition to constructors
}

/**
 * Helper class for adding sub valiators to Schemas
 */
const SubValidation = class ConfigureSubValidator extends Callable<(...args: unknown[]) => SubSchema> { 

    constructor(readonly Type: ValidateConstructor, target: SubSchema, private _id?: symbol) {
        
        super(function configureSubValidator(
            this: [SubSchema, ConfigureSubValidator], 
            ...args: unknown[]
        ) {

            const [schema, configurer] = this

            // Determine if disable signature
            const isDisableSignature = args.length === 1 && args[0] === false

            // Remove if disabled
            const enabled = isDisableSignature ? false : true
            if (!enabled && configurer._id) 
                return schema.removeValidator(configurer._id)

            // Upsert if enabled
            else if (enabled) {

                const newSubValidator = new configurer.Type(...args)

                // ensure sub validator id
                configurer._id ??= 
                    resolveSubvalidatorId(newSubValidator) ?? 
                    Symbol(`sub-validator-${newSubValidator.name}`)

                return schema.validates(newSubValidator, configurer._id)
            }

            return schema
            // provide both the function's this context and subvalidator
        }, (schema, configurer) => [schema ?? target, configurer])
    }

} as SubValidatorConstructor

//// Exports ////

export default SubValidation

export {
    SubValidation
}
