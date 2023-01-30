import { Callable, OutputOf } from '@benzed/util'

import { AnyValidate } from '../validator/validate'

import type { Schema } from '../schema'
import { resolveSubvalidatorId } from '../abstract-schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////  

type ValidateConstructor<V extends AnyValidate = AnyValidate> = new (...args: any) => V

//// Main ////

type SubSchema<T> = Pick<Schema<any,T>, 'validates' | 'remove'>

type SubValidationSignature<V extends ValidateConstructor> = 
    | [enabled: false] 
    | ConstructorParameters<V>

interface SubValidatorConstructor {

    new <V extends ValidateConstructor, S extends SubSchema<OutputOf<InstanceType<V>>>>(
        validateConstructor: V, 
        schema: S,
        id?: symbol
    ): SubValidation<SubValidationSignature<V>, S>

}

interface SubValidation<A extends any[], S extends SubSchema<any>> {

    (this: S, ...args: A): S

    // TODO also add nested methods from SubValidator
    // TODO also allow Validator/Schema instances in addition to constructors
}

/**
 * Helper class for adding sub valiators to Schemas
 */
const SubValidation = class ConfigureSubValidator extends Callable<(...args: unknown[]) => SubSchema<any>> { 

    constructor(readonly Type: ValidateConstructor, target: SubSchema<any>, private _id?: symbol) {
        
        super(function configureSubValidator(
            this: [SubSchema<any>, ConfigureSubValidator], 
            ...args: unknown[]
        ) {

            const [schema, configurer] = this

            // Determine if disable signature
            const isDisableSignature = args.length === 1 && args[0] === false

            // Remove if disabled
            const enabled = isDisableSignature ? false : true
            if (!enabled && configurer._id) 
                return schema.remove(configurer._id)

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
