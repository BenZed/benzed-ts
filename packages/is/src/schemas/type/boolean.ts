import { isBoolean as isBoolean, isNil } from '@benzed/util'
import Type, { TypeExtendSettings } from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface BooleanSettings extends TypeExtendSettings<boolean> {}

//// Helper ////

const toBoolean = (
    input: unknown
): unknown => input === 'false' || input === 0 || input === BigInt(0) || isNil(input) 
    ? false
    : input === 'true' || input === 1 || input === BigInt(1)
        ? true
        : input

//// Exports ////

class Boolean extends Type<boolean> {

    constructor(settings?: BooleanSettings) {
        super({
            name: 'boolean',
            isValid: isBoolean,
            cast: toBoolean,
            ...settings
        })
    }

}

//// Exports ////

export default Boolean

export {
    Boolean,
    BooleanSettings
}

export const $boolean = new Boolean()
