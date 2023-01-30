import { Func, isFunc } from '@benzed/util'
import Type, { TypeExtendSettings } from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface FunctionSettings extends TypeExtendSettings<Func> {}

//// Exports ////

class Function extends Type<Func> {

    constructor(settings?: FunctionSettings) {
        super({
            name: 'function',
            isValid: isFunc,
            ...settings
        })
    }

}

//// Exports ////

export default Function

export {
    Function,
    FunctionSettings
}

export const $function = new Function()
