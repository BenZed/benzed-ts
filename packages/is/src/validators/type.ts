import { applyResolver, nil, Pipe, through, toNil } from '@benzed/util'
import { fail } from 'assert'

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
 type Default<T> = (ctx: ValidatorContext<unknown>) => T | nil

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

const applyDefault = <T>(toDefault: Default<T> = toNil) => 
    (i: unknown, ctx: ValidatorContext<unknown>) => 
        i === nil ? toDefault(ctx) : i

const applyCast = <T>(cast: Cast<T> = through, is: ValidatorTypeGuard<unknown, T> = fail) => 
    (i: unknown, ctx: ValidatorContext<unknown>) => applyResolver(is(i, ctx), isValid => isValid ? i : cast(i, ctx))

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

    constructor(settings: TypeValidatorSettings<T>) {

        const { type, default: toDefault, is, cast, error = `Must be type ${type}`, ...rest } = settings

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
    TypeValidatorSettings,
    Cast as TypeValidatorCast,
    Default as TypeValidatorDefault
}