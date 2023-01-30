import { isFunc, isObject, isOneOf } from '@benzed/util'
import Type, { TypeExtendSettings } from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface ObjSettings extends TypeExtendSettings<object> {}

//// Exports ////

class Obj extends Type<object> {

    constructor(settings?: ObjSettings) {
        super({
            name: 'object',
            isValid: isOneOf(isFunc, isObject),
            ...settings
        })
    }

}

//// Exports ////

export default Obj

export {
    ObjSettings
}

export const $object = new Obj()
