import { isFunc, isNil, nil, returns } from '@benzed/util'

import { 
    ValidationErrorMessage,
} from '../../../../schema/src/validator'

import {
    TypeValidator,
    TypeValidatorSettings,
    TypeValidatorCast,
    TypeValidatorDefault 
} from '@benzed/is/src/validators'
import Schema from '../../../../schema/src/schema/_old-schema'

import Schema from '../../../../schema/src/schema/schema'

//// Constants ////

const $$type = Symbol('type-validator-id')

//// Types ////

class Type<T> extends Schema<T> {

    override get name(): string {
        return this.validators.at(0)?.name ?? 'Type'
    }

    constructor(input: TypeValidatorSettings<T> | TypeValidator<T>) {
        super(
            new TypeValidator(input)
        )
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
    named(name: string): this {
        return this._setTypeValidator({ name: name }) 
    }

    /**
     * Change the thrown error
     */
    error(error: string | ValidationErrorMessage<unknown>): this {
        return this._setTypeValidator({ error })
    }

    //// Helper ////
    
    get typeValidator(): TypeValidator<T> {
        const type = this.validators.find((v): v is TypeValidator<T> => v instanceof TypeValidator)
        if (!type) 
            throw new Error('Type validator missing.')
        return type
    }

    protected _setTypeValidator(
        settings: Partial<TypeValidatorSettings<T>>
    ): this {
        return Schema.upsert(
            this, 
            (type?: TypeValidator<T>) => new TypeValidator({ 
                ...(type as TypeValidatorSettings<T>), 
                name: this.name, 
                ...settings 
            }),
            $$type
        )
    }
}

//// Exports ////

export default Type

export { Type }