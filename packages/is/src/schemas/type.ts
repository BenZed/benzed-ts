import { isFunc, isNil, nil, returns } from '@benzed/util'

import { 
    Schema,
} from '../schema'

import { 
    ValidationErrorMessage,
    Validate, 
} from '../validator'

import {
    TypeValidator,
    TypeValidatorSettings,
    TypeValidatorCast,
    TypeValidatorDefault 
} from '../validators'

//// Types ////

class TypeSchema<T> extends Schema<T> {

    constructor(input: TypeValidatorSettings<T> | TypeValidator<T>) {
        super(new TypeValidator(input)) 
    }

    /**
     * If the given input is not of the expected type,
     * this method will try to convert it.
     * 
     * Undefined will disable casting 
     */
    cast(cast: TypeValidatorCast<T> | nil): this {
        return this._setTypeValidator({ cast })
    }

    /**
     * Provide a default value for this schema, in
     * the event it is
     *
     * @param _default 
     */
    default(_default: TypeValidatorDefault<T> | T | nil): this {
        return this._setTypeValidator({
            default: isFunc(_default) || isNil(_default) 
                ? _default 
                : returns(_default)
        })
    }

    /**
     * Change the name of the type when the error is thrown
     */
    type(name: string): this {
        return this._setTypeValidator({ type: name }) 
    }

    /**
     * Change the thrown error
     */
    error(error: string | ValidationErrorMessage<unknown>): this {
        return this._setTypeValidator({ error })
    }

    protected _setTypeValidator(settings: Partial<TypeValidatorSettings<T>>): this {
        return this._setValidator(
            TypeValidator, 
            t => t.applySettings({ ...t, ...settings })
        )
    }
         
}

//// Exports ////

export default TypeSchema
export {
    TypeSchema
}