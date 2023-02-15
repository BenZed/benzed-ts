
import { ValidationErrorMessage } from '@benzed/schema'
import { 
    isBigInt, 
    isFinite, 
    isNumber, 
    isString, 
    SignatureParser 
} from '@benzed/util'

import {
    NameMessageEnabledSignature,
    toNameMessageEnabled,
    TypeValidator
} from '../../../validators'

import { TypeSchema } from '../../type'

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

//// StringValueSubValidator Signature ////

const toNameMessageEnabledValue = new SignatureParser({
    ...toNameMessageEnabled.types,
    value: isString
})
    .setDefaults({
        ...toNameMessageEnabled.defaults
    })
    .addLayout('enabled')
    .addLayout('value', 'message', 'name')

type NameMessageEnabledValueSignature =
    | [ enabled?: boolean ]
    | [ value: string, message?: ValidationErrorMessage<string>, name?: string ] 
    | [ settings: { value: string, message?: ValidationErrorMessage<string>, name?: string }]

//// Types ////

class StringValidator extends TypeValidator<string> {

    isValid(value: unknown): value is string {
        return isString(value)
    }

    override readonly cast = castToString
}

//// Schema ////

type StringSubValidators = Readonly<{
    camel: Camel
    capitalize: Capitalized
    endsWith: EndsWith
    includes: Includes
    lower: Lower
    startsWith: StartsWith
    trim: Trimmed
    upper: Upper
}>

//// Implementation ////

class String extends TypeSchema<StringValidator, StringSubValidators> {

    constructor() {
        super(
            new StringValidator, 
            {
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

    //// Sub Validator Interface ////

    camel(...sig: NameMessageEnabledSignature<string>): this {
        return this._applyBasicSubValidator('camel', ...sig)
    }

    lower(...sig: NameMessageEnabledSignature<string>): this {
        return this._applyBasicSubValidator('lower', ...sig)
    }

    upper(...sig: NameMessageEnabledSignature<string>): this {
        return this._applyBasicSubValidator('upper', ...sig)
    }

    capitalize(...sig: NameMessageEnabledSignature<string>): this {
        return this._applyBasicSubValidator('capitalize', ...sig)
    }

    trim(...sig: NameMessageEnabledSignature<string>): this {
        return this._applyBasicSubValidator('trim', ...sig)
    }
    
    startsWith(...sig: NameMessageEnabledValueSignature): this {
        const nameMessageEnabledValue = toNameMessageEnabledValue(...sig)
        return this._applySubValidator('startsWith', nameMessageEnabledValue)
    }

    endsWith(...sig: NameMessageEnabledValueSignature): this {
        const nameMessageEnabledValue = toNameMessageEnabledValue(...sig)
        return this._applySubValidator('endsWith', nameMessageEnabledValue)
    }

    includes(...sig: NameMessageEnabledValueSignature): this {
        const nameMessageEnabledValue = toNameMessageEnabledValue(...sig)
        return this._applySubValidator('includes', nameMessageEnabledValue)
    }

}

//// Exports ////

export { String }

export const $string = new String()