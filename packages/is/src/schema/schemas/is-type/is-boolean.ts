import { isBoolean as _isBoolean, isNil } from '@benzed/util'
import IsType from './is-type'

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

class IsBoolean extends IsType<boolean> {
    constructor() {
        super({
            type: 'boolean',
            is: _isBoolean,
            cast: toBoolean
        })
    }
}

//// Exports ////

export default IsBoolean

export {
    IsBoolean
}

export const isBoolean = new IsBoolean