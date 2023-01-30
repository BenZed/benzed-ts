import { isFunc, isNil, nil, returns, through, toNil } from '@benzed/util'

import { 
    Schema, 
    ValidateContext, 
    ValidatorPredicate, 
    ValidatorSettings, 
    ValidatorTypeGuard 
} from '@benzed/schema'

//// Types ////

/**
 * Method that potentially converts a value to the target type.
 */
type Cast<T> = (
    i: unknown, 
    ctx: ValidateContext<unknown>
) => T | unknown

/**
 * Method that provides a default value, if the input was undefined or null
 */
type Default<T> = (ctx: ValidateContext<unknown>) => T | nil

interface TypeExtendSettings<T> extends Omit<ValidatorSettings<unknown,T>, 'transform' | 'isValid'> {
    
    /**
     * Method that potentially converts a value to the target type.
     */
    cast?: Cast<T>

    /**
     * Method that provides a default value, if the input is undefined
     */
    default?: Default<T>
}

interface TypeSettings<T> extends TypeExtendSettings<T> {
    isValid: ValidatorTypeGuard<unknown, T>
}

//// Implementation ////

class Type<T> extends Schema<unknown, T> {

    constructor({ isValid, ...settings }: TypeSettings<T>) {

        type IsValid = T extends unknown 
            ? ValidatorTypeGuard<unknown, T> | ValidatorPredicate<unknown> 
            : ValidatorPredicate<unknown>

        super({
            // Defaults
            default: toNil,
            cast: through,

            // Settings
            ...settings,

            // Non Settable,
            isValid: isValid as IsValid,
            transform(this: TypeSettings<T>, input: unknown, ctx: ValidateContext<unknown>): unknown {
                if (input === nil && this.default)
                    input = this.default(ctx)

                if (!this.isValid(input, ctx) && this.cast)
                    input = this.cast(input, ctx)

                return input
            }
        })

        if (this.constructor.name === 'WeakSet')
            console.log(settings)
    }

    /**
     * If the given input is not of the expected type,
     * this method will try to convert it.
     * 
     * Undefined will disable casting 
     */
    cast(cast: Cast<T> | nil): this {
        return this._updateMainValidator({ cast })
    }

    /**
     * Provide a default value for this schema, in
     * the event it is
     *
     * @param defaulter 
     */
    default(defaulter: Default<T> | T | nil): this {
        return this._updateMainValidator({
            default: isFunc(defaulter) || isNil(defaulter) 
                ? defaulter 
                : returns(defaulter)
        })
    }

    //// Overrides ////
    
    protected override _updateMainValidator<V extends TypeExtendSettings<T>>(settings: V): this {
        return super._updateMainValidator(settings)
    }

}

//// Exports ////

export default Type

export { 
    Type,
    Cast as TypeCast,
    Default as TypeDefault,
    TypeSettings,
    TypeExtendSettings,
}