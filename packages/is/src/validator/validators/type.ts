import { capitalize } from '@benzed/string'
import { applyResolver, defined, merge, nil, Property } from '@benzed/util'

import {
    Validate, 
    ValidateOptions, 
    ValidationError, 
    ValidationErrorMessage 
} from '../'

import {
    createValidatorContext,
    ValidatorContext,
    ValidatorTransform,
    ValidatorTypeGuard
} from '../validator'

//// Types ////

/**
 * Method that potentially converts a value to the target type.
 */
type Cast<T> = (
    i: unknown, 
    ctx: ValidatorContext<unknown>
) => T | unknown

/**
 * Method that provides a default value, if the input was undefined or null
 */
type Default<T> = (ctx: ValidatorContext<unknown>) => T | nil

interface TypeValidatorSettings<T> {

    /**
     * Name of the type
     */
    readonly name: string

    readonly is: ValidatorTypeGuard<unknown, T>

    readonly error?: string | ValidationErrorMessage<unknown>

    /**
     * Default cast method for this type
     */
    readonly cast?: Cast<T>

    /**
     * Method for setting this type's default value
     */
    readonly default?: Default<T>

    /**
     * Arbitrary method for transform type typed input
     */
    readonly transform?: ValidatorTransform<unknown, T>

    readonly id?: symbol
}

type AnyTypeValidator = TypeValidator<unknown>

type AnyTypeValidatorSettings = TypeValidatorSettings<unknown>

type TypeValidatorOutput<S extends AnyTypeValidatorSettings> = 
    S extends TypeValidatorSettings<infer T> 
        ? T 
        : unknown

type TypeValidatorAdditional<S extends AnyTypeValidatorSettings> = {
    [K in Exclude<keyof S, keyof AnyTypeValidatorSettings>]: S[K]
}

//// Helper ////

function validateType<T>(this: TypeValidator<T>, i: unknown, options?: ValidateOptions): T {

    const ctx = createValidatorContext(i, options)

    // apply default
    const defaulted = i === nil && this.default 
        ? this.default(ctx) 
        : i

    const casted = applyResolver(defaulted, defaulted => {

        ctx.transformed = defaulted

        // apply cast
        if (!this.is(defaulted, ctx) && this.cast)
            defaulted = this.cast(defaulted, ctx)

        return defaulted
    })

    const validated = applyResolver(casted, casted => {

        if (!this.is(casted, ctx))
            ValidationError.throw(this.error, ctx)

        return casted
    })

    return validated as T
}

//// Validator ////

class TypeValidator<T> extends Validate<unknown, T> implements TypeValidatorSettings<T> {

    static create<Tx>(settings: TypeValidatorSettings<Tx>): TypeValidator<Tx>
    static create<S extends AnyTypeValidatorSettings>(settings: S): TypeValidator<TypeValidatorOutput<S>> & TypeValidatorAdditional<S> 
    static create({ 
        name, 
        default: _default, 
        is, 
        cast,
        error, 
        ...settings 
    }: TypeValidatorSettings<unknown>): AnyTypeValidator {

        const validator = new TypeValidator({
            name,
            default: _default,
            is,
            cast,
            error
        })

        return merge(validator, defined(settings))
    }

    constructor({ 
        name, 
        default: toDefault, 
        is, 
        cast, 
        error = `Must be ${name}` 
    }: TypeValidatorSettings<T>) {

        super(validateType)

        this.is = is

        if (cast) {
            this.cast = Property.name(
                cast,
                cast.name && cast.name !== 'cast' 
                    ? cast.name 
                    : `castTo${capitalize(name)}`
            )
        }

        this.name = name

        this.error = error

        if (toDefault) {
            this.default = Property.name(
                toDefault, 
                toDefault.name && toDefault.name !== 'default' 
                    ? toDefault.name 
                    : `toDefault${capitalize(name)}`
            )
        }
    }

    override readonly name: string

    readonly error: string | ValidationErrorMessage<unknown>

    readonly cast?: Cast<T>

    readonly default?: Default<T>

    readonly is: ValidatorTypeGuard<unknown, T>

}

//// Exports ////

export default TypeValidator 

export {
    TypeValidator,
    TypeValidatorSettings,
    Cast as TypeValidatorCast,
    Default as TypeValidatorDefault
}