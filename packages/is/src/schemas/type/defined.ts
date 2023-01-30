import { Primitive, nil, isNil } from '@benzed/util'
import Type, { TypeExtendSettings } from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Setup ////

type defined = Exclude<Primitive, nil | null> | object

//// Types ////

interface DefinedSettings extends TypeExtendSettings<defined> {}

//// Exports ////

class Defined extends Type<defined> {

    constructor(settings?: DefinedSettings) {
        super({
            name: 'defined',
            isValid(input: unknown): input is defined {
                return !isNil(input)
            },
            ...settings
        })
    }

}

//// Exports ////

export default Defined

export {
    Defined,
    DefinedSettings
}

export const $defined = new Defined()
