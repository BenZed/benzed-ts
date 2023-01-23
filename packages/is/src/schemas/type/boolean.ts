import { isBoolean as _isBoolean, isNil } from '@benzed/util'
import TypeValidator from '@benzed/is/validators/type'
import Schema from '../../../../schema/src/schema/schema'

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

export interface Boolean extends Schema<TypeValidator<boolean>> {}
export const isBoolean: Boolean = new Schema(TypeValidator.create({ 
    name: 'boolean',
    is: _isBoolean,
    cast: toBoolean
}))

