import { isBoolean as _isBoolean, isNil } from '@benzed/util'
import Type from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Helper ////

const toBoolean = (input: unknown): unknown => input === 'false' || input === 0 || isNil(input) 
    ? false
    : input === 'true' || input === 1 
        ? true 
        : input

//// Exports ////

export interface Boolean extends Type<boolean> {}
export const isBoolean: Boolean = new Type({ 
    name: 'boolean',
    is: _isBoolean,
    cast: toBoolean
})