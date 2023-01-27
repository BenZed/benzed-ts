
import { Infer, nil, Transform } from '@benzed/util'

import {
    AnyValidate,
    ValidateContext,
    ValidationErrorInput,
    Validator,
    ValidatorTransform,
    ValidatorTypeGuard
} from '../../validator'

import { SchemaSettingsOutput, SubValidatorConstructor, ToSchemaSettings } from '../schema-types'
import { Schema, } from '../schema'

//// Types ////

/**
 * Attempt to convert the input type to the desired type
 */
type Cast = ValidatorTransform<unknown>

/**
 * Provide a default if the input is undefined
 */
type Default<T> = Transform<ValidateContext<nil>, T | nil>

interface TypeSettings<T> {

    name: string 

    isValid: ValidatorTypeGuard<unknown,T>

    error?: ValidationErrorInput<unknown>
    cast?: Cast
    default?: Default<T>

}

type ToTypeSettings<T> = ToSchemaSettings<unknown, T, TypeSettings<T>>

interface Type<T> extends Schema<unknown, T, ToTypeSettings<T>> {

    // overridden to make the type inference nicer
    named(name: string): this
    cast(caster?: Cast): this
    default(defaulter?: Default<T>): this
    error(error: ValidationErrorInput<unknown>): this

}

type TypeValidator<T = unknown> = Validator<unknown, T>

type TypeAddSubValidatorSettings<T, S extends Record<string, AnyValidate | SubValidatorConstructor>> = 
    Infer<
    SchemaSettingsOutput<ToTypeSettings<T>> & 
    SchemaSettingsOutput<S>
    >

//// Settings ////

type DefaultTypeSettings<T> = Omit<TypeSettings<T>, 'isValid'> & { transform: ValidatorTransform<unknown, T> }
const defaultTypeSettings: DefaultTypeSettings<unknown> = {

    name: 'unknown',

    error(): string {
        return `Must be a ${this.name}`
    },

    transform (input: unknown, ctx: ValidateContext<unknown>): unknown {

        if (input === nil && this.default)
            input = this.default(ctx as ValidateContext<nil>)

        if (!(this as TypeValidator).isValid(input, ctx) && this.cast)
            input = this.cast(input, ctx)

        return input
    }

}

//// Exports ////

export {
    Cast,
    Default,
    TypeSettings,
    ToTypeSettings,
    Type,
    TypeAddSubValidatorSettings,

    DefaultTypeSettings,
    defaultTypeSettings
}