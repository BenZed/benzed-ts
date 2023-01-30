import { isUnknown } from '@benzed/util'
import Type, { TypeExtendSettings } from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface UnknownSettings extends TypeExtendSettings<unknown> {}

//// Exports ////

class Unknown extends Type<unknown> {

    constructor(settings?: UnknownSettings) {
        super({
            name: 'unknown',
            isValid: isUnknown,
            ...settings
        })
    }

}

//// Exports ////

export default Unknown

export {
    Unknown,
    UnknownSettings
}

export const $unknown = new Unknown()
