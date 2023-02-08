
import { Schema, SchemaConstructor } from '@benzed/schema'

import { isBigInt, isFinite, isNumber, isString } from '@benzed/util'

import { ConfigurableTypeValidator } from '../type'

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

const castToString = (i: unknown): unknown => 
    isNumber(i) && isFinite(i) || isBigInt(i)
        ? `${i}`
        : i

//// Types ////

class StringValidator extends ConfigurableTypeValidator<string> {

    isValid(value: unknown): value is string {
        return isString(value)
    }

    override readonly cast = castToString
}

//// Schema ////

type StringSubValidators = {
    camel: Camel
    capitalize: Capitalized
    endsWith: EndsWith
    includes: Includes
    lower: Lower
    startsWith: StartsWith
    trim: Trimmed
    upper: Upper
}

interface String extends Schema<StringValidator, StringSubValidators> {

    // Make the sub validator configuration return types nice
    camel(): this 
    lower(): this 
    upper(): this 

    trim(): this 

    capitalize(): this 

    includes(): this 

    startsWith(): this 
    endsWith(): this 
}

interface StringConstructor extends SchemaConstructor {
    new (): String
}

//// Implementation ////

const String = class String extends Schema<StringValidator, StringSubValidators> {

    constructor() {
        super(
            new StringValidator, {
                camel: new Camel,
                lower: new Lower,
                upper: new Upper,

                capitalize: new Capitalized,

                startsWith: new StartsWith,
                endsWith: new EndsWith,

                includes: new Includes,
                trim: new Trimmed,
            }
        )
    }

} as StringConstructor

//// Exports ////

export { String }

export const $string = new String()