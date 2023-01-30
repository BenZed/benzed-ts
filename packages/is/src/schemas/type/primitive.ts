import { isPrimitive, Primitive as Primitives } from '@benzed/util'
import Type, { TypeExtendSettings } from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface PrimitiveSettings extends TypeExtendSettings<object> {}

//// Exports ////

class Primitive extends Type<Primitives> {

    constructor(settings?: PrimitiveSettings) {
        super({
            name: 'primitive',
            isValid: isPrimitive,
            ...settings
        })
    }

}

//// Exports ////

export default Primitive

export {
    PrimitiveSettings
}

export const $object = new Primitive()
