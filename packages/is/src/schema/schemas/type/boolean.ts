import { isBoolean as _isBoolean, isNil } from '@benzed/util'
import Type from './type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

const toBoolean = (input: unknown): unknown => input === 'false' || input === 0 || isNil(input) 
    ? false
    : input === 'true' || input === 1 
        ? true 
        : input

//// Boolean ////

class Boolean extends Type<boolean> {
    constructor() {
        super({
            name: 'boolean',
            is: _isBoolean,
            cast: toBoolean
        })
    }
}

//// Exports ////

export default Boolean

export {
    Boolean
}

export const isBoolean = new Boolean