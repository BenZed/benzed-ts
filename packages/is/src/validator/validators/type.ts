import { capitalize } from '@benzed/string'
import { ContextPipe, nil, Pipe, Property } from '@benzed/util'

import Validator, { ValidatorContext, ValidatorSettings, ValidatorTransform, ValidatorTypeGuard } from '../validator'
//// Types ////

/**
 * Method that potentially converts a value to the target type.
 */
 type Cast<T> = (i: unknown, ctx: ValidatorContext<unknown>) => T | unknown

 /**
  * Method that provides a default value, if the input was undefined or null
  */
 type Default<T> = (ctx: ValidatorContext<unknown>) => T | nil

interface TypeValidatorSettings<T> extends Partial<Omit<ValidatorSettings<unknown, T>, 'transform' | 'is'>> {

    /**
     * Name of the type
     */
    readonly name: string

    readonly is: ValidatorTypeGuard<unknown, T>

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

}

//// Validator ////

class TypeValidator<T> extends Validator<unknown, T> implements TypeValidatorSettings<T> {

    /**
     * Name of the type
     */
    override readonly name: string

    /**
     * Default cast method for this type
     */
    readonly cast?: Cast<T>

    /**
     * Method for setting this type's default value
     */
    readonly default?: Default<T>

    override readonly transform: ValidatorTransform<unknown>

    constructor(settings: TypeValidatorSettings<T>) {

        const { name, transform, default: toDefault, cast, error = `Must be type ${name}`, ...rest } = settings
 
        super({
            error,
            ...rest
        })

        const applyDefaultAndCast: ValidatorTransform<unknown, T> = function (this: TypeValidator<T>, i, ctx) {

            // apply default
            if (i === nil && this.default)  
                i = this.default(ctx)

            // apply cast
            if (!this.is(i, ctx) && this.cast)
                i = this.cast(i, ctx)

            return i
        }

        this.name = name

        this.cast = cast && Property.name(
            cast,
            cast.name && cast.name !== 'cast' ? cast.name : `castTo${capitalize(name)}`
        )

        this.default = toDefault && Property.name(
            toDefault, 
            toDefault.name && toDefault.name !== 'default' ? toDefault.name : `toDefault${capitalize(name)}`
        )

        let pipe = Pipe.from(applyDefaultAndCast)
        if (transform)
            pipe = pipe.to(transform)

        this.transform = pipe
    }
}

//// Exports ////

export {
    TypeValidator,
    TypeValidatorSettings,
    Cast as TypeValidatorCast,
    Default as TypeValidatorDefault
}