import { Property } from '@benzed/util'

/**
 * Id of a validator, used for cases where updating a validator
 * means replacing another one
 */
export const $$id = Symbol('schema-validator-id')

/**
 * Id of the main validator in a schematic.
 */
export const $$mainId = Symbol('schema-main-validator-id')

/**
 * Property added to settings updates with additional sub validator configuration
 */
export const $$subConfig = Symbol('schema-apply-sub-validator-config')

/**
 * Place as a property on Validator constructors so that
 * a schema may create settings appliers for it.
 */
export const $$constructor = Symbol('validator-constructor')

//// Helper ////

export const defineSymbol = (object: object, key: symbol, value: unknown): void => 
    void Property.define(
        object, 
        key, { 
            value, 
            enumerable: true, 
            configurable: true
        })