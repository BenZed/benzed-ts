import { Property } from '@benzed/util'
import { AnyValidate } from '../validator'

/**
 * Id of a validator, used for cases where updating a validator
 * means replacing another one
 */
export const $$id = Symbol('validator-id')

/**
 * Id of the main validator in a schematic.
 */
export const $$mainId = Symbol('main-validator-id')

/**
 * Property added to settings updates with additional sub validator configuration
 */
export const $$subConfig = Symbol('apply-sub-validator-config')

//// Helper ////

export const defineSymbol = <T extends object>(input: T, key: symbol, value: unknown): T => 
    Property.define(
        input, 
        key, { 
            value, 
            enumerable: true, 
            configurable: true
        })

export const defineMainValidatorId = <V extends AnyValidate>(input: V): V => 
    defineSymbol(input, $$id, $$mainId)