
import { SubValidation } from '@benzed/schema'
import { isBigInt, isFinite, isNumber, isString } from '@benzed/util'

import {
    Type,
    TypeCast,
    TypeExtendSettings
} from '../type'

import {
    Camel,
    Capitalized,
    EndsWith,
    Includes,
    Lower,
    StartsWith,
    Trimmed,
    Upper
} from './string-sub-validators'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// String Validation Defaults ////

const castToString: TypeCast<string> = (i) => 
    isNumber(i) && isFinite(i) || isBigInt(i)
        ? `${i}`
        : i

//// Types ////

interface StringSettings extends TypeExtendSettings<string> {}
    
//// String Schema Implementation ////

class String extends Type<string> {

    constructor(settings?: StringSettings) {
        super({
            cast: castToString,
            ...settings,
            isValid: isString,
        })
    }

    trim = new SubValidation(Trimmed, this)

    lowerCase = new SubValidation(Lower, this)
    upperCase = new SubValidation(Upper, this)
    camelCase = new SubValidation(Camel, this)
    capitalize = new SubValidation(Capitalized, this)

    includes = new SubValidation(Includes, this)
    endsWith = new SubValidation(EndsWith, this)
    startsWith = new SubValidation(StartsWith, this)

}

//// Exports ////

export { String }

export const $string = new String()