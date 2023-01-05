import { applyResolver, isNil, isNotNil, Pipe, through, } from '@benzed/util'

import { 
    ValidatorContext,
    Validator, 
    ValidatorSettings,
    ValidatorTypeGuard
} from '../validator'

//// Types ////

/**
 * Method that potentially converts a value to the target type.
 */
 type Cast<T> = (i: unknown, ctx: ValidatorContext<unknown>) => T | unknown

 /**
  * Method that provides a default value, if the input was undefined or null
  */
 type Default<T> = (ctx: ValidatorContext<unknown>) => T

interface TypeValidatorSettings<T> extends Omit<ValidatorSettings<unknown, T>, 'transform'> {

    /**
     * Name of the type
     */
    readonly type: string

    /**
     * Default cast method for this type
     */
    readonly cast?: Cast<T>

    /**
     * Method for setting this type's default value
     */
    readonly default?: Default<T>

}

//// Helpers ////

const applyDefault = <T>(toDefault: Default<T> = through as Default<T>) => 
    (i: unknown, ctx: ValidatorContext<unknown>) => 
        isNil(i) ? toDefault(ctx) : i

const applyCast = <T>(cast: Cast<T> = through, is: ValidatorTypeGuard<unknown, T> = isNotNil) => 
    (i: unknown, ctx: ValidatorContext<unknown>) => cast 
        ? applyResolver(is(i, ctx), isValid => isValid ? i : cast(i, ctx))
        : i

////  ////

class TypeValidator<T> extends Validator<unknown, T> implements TypeValidatorSettings<T> {

    /**
     * Name of the type
     */
    readonly type: string

    /**
     * Default cast method for this type
     */
    readonly cast?: Cast<T>

    /**
     * Method for setting this type's default value
     */
    readonly default?: Default<T>

    constructor({ type, default: toDefault, is, cast, error = `Must be type ${type}`, ...rest }: TypeValidatorSettings<T>) {

        const maybeAsyncTransform = Pipe
            .from(applyDefault(toDefault))
            .to(applyCast(cast, is))

        super({
            ...rest,
            error,
            is,
            transform: maybeAsyncTransform
        })

        this.type = type
        this.cast = cast
        this.default = toDefault
    }

}

//// Exports ////

export {
    TypeValidator,
    TypeValidatorSettings
}