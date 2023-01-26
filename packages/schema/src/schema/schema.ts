
import { isFunc, keysOf, ParamPipe, Pipe } from '@benzed/util'
import { 

    AllowedValidatorSettings,
    AnyValidatorSettings, 
    ValidateContext, 

    ValidationErrorInput, 
    Validator, 

    ValidatorPredicate, 
    ValidatorTransform 
} from '../validator'

import {
    AnyValidate, 
    Validate, 
    ValidateOptions
} from '../validator/validate'

import ensureAccessors from './ensure-accessors'

import { 
    SchemaConstructor, 
    SchemaProperties, 
    SchemaSetters, 
    SchemaSettingsInput,
    SchemaSettingsOutput
} from './schema-types'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Type ////

type Schema<I, O, T extends SchemaSettingsInput<O>> = 
    SchemaProperties<I, O, T> & 
    SchemaSetters<I,O,T>

type ValidatorPipe<I, O> = ParamPipe<I, O, [options?: Partial<ValidateOptions>]>

//// Helper ////

function schemaSettingsOutput(input: object): SchemaSettingsOutput<object> {

    const output = { ...input } as Record<string, object>
    for (const key of keysOf(output)) {
        if (output[key] instanceof Validate)
            output[key] = schemaSettingsOutput(output[key])
    }

    return output
}

//// Validate ////

function schemaValidator <I,O>(this: { validate: Validate<I, O> }, i: I, options?: Partial<ValidateOptions>): O {
    const ctx = new ValidateContext(i, options)
    return this.validate(i, ctx)
}

//// Implementation ////

const Schema = class extends Validate<unknown, unknown> {

    readonly validate: ValidatorPipe<unknown,unknown>

    constructor(settings: object) {
        super(schemaValidator)

        const validator = Validator.from(settings)
        this.validate = Pipe.from(validator)
        ensureAccessors(this, settings)
    }

    override get name(): string {
        const [ mainValidator ] = this.validators
        return mainValidator.name
    }

    get settings(): SchemaSettingsOutput<object> {
        const [ mainValidator ] = this.validators
        return schemaSettingsOutput(mainValidator)
    }

    //// Validation Interface ////
    
    validates(
        input: Partial<AnyValidatorSettings> | AnyValidate
    ): this {
        let validate = isFunc(input) ? input : Validator.from(input)
        
        validate = Pipe.from(
            Validator.merge(...this.validators, validate)
        )

        return this.apply({ validate })
    }

    asserts(
        isValid: ValidatorPredicate<unknown>,
        error?: ValidationErrorInput<unknown>
    ): this {
        return this.validates({
            isValid,
            error
        })
    }

    transforms(
        transform: ValidatorTransform<unknown>,
        error?: ValidationErrorInput<unknown>
    ): this {
        return this.validates({
            transform,
            error
        })
    }

    //// Apply ////
    
    override apply(settings: object): this {
        return Validator.apply(this, settings as AllowedValidatorSettings<this>)
    }

    //// Iteration ////
    
    get validators(): AnyValidate[] {
        return Array.from(this)
    }

    *[Symbol.iterator](): IterableIterator<AnyValidate> {
        yield* (this as { validate: ValidatorPipe<unknown, unknown> }).validate.transforms
    }

} as SchemaConstructor

//// Exports ////

export default Schema 

export { 
    Schema,
    ValidatorPipe
} 