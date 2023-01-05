import { nil, pass, } from '@benzed/util'

import { 
    ValidatorContext,
    Validator, 
    ValidatorSettings 
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
    type: string

    /**
     * Default cast method for this type
     */
    cast?: Cast<T>

    /**
     * Method for setting this type's default value
     */
    default?: Default<T>

}

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

    constructor({ assert = pass, error, type, cast, default: _default }: TypeValidatorSettings<T>) {
        super({
            transform: (input: unknown, ctx: ValidatorContext<unknown>): unknown | T => {
    
                if (input === nil && this.default)
                    input = this.default(ctx)
            
                if (!this.assert?.(input, ctx) && this.cast)
                    input = this.cast(input, ctx)
            
                return input
            },
            assert,
            error
        })

        this.type = type
        this.cast = cast
        this.default = _default
    }

}

//// Exports ////

export {
    TypeValidator,
    TypeValidatorSettings
}