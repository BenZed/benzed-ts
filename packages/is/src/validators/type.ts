import { nil } from '@benzed/util'

import { 
    ValidatorContext,
    Validator, 
    ValidatorTypeGuard,
    ValidatorSettings,
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

interface TypeValidatorSettings<T> extends Omit<ValidatorSettings<unknown, T>, 'transform' | 'is'> {

    /**
     * Name of the type
     */
    readonly type: string

    readonly is: ValidatorTypeGuard<unknown, T>

    /**
     * Default cast method for this type
     */
    readonly cast?: Cast<T>

    /**
     * Method for setting this type's default value
     */
    readonly default?: Default<T>

}

//// Validator ////

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

        const { type, default: toDefault, cast, error = `Must be type ${type}`, ...rest } = settings
 
        super({
            error,
            ...rest
        })

        this.type = type
        this.cast = cast
        this.default = toDefault
        this.transform = (i, ctx) => {

            // apply default
            if (i === nil && this.default)  
                i = this.default(ctx)

            // apply cast
            if (!this.is(i, ctx) && this.cast)
                i = this.cast(i, ctx)
            
            return i
        }
    }
}

//// Exports ////

export {
    TypeValidator,
    TypeValidatorSettings,
    Cast as TypeValidatorCast,
    Default as TypeValidatorDefault
}