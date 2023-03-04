
import { TypeSchema, TypeValidator } from '@benzed/schema'
import { 
    isBigInt, 
    isFinite, 
    isNumber, 
    isString, 
} from '@benzed/util'

import {
    Casing,
    EndsWith,
    Includes,
    StartsWith,
    Trimmed,
} from './sub-validators'

import {
    toStringValueSettings,
    StringValueSettingsSignature
} from './sub-validators/string-value-sub-validator'

import {
    NameMessageEnabledSettingsSignature, 
    toNameMessageEnabledSettings 
} from '../../util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

class StringValidator extends TypeValidator<string> {

    isValid(value: unknown): value is string {
        return isString(value)
    }

    override cast(input: string) {
        return isNumber(input) && isFinite(input) || isBigInt(input)
            ? `${input}`
            : input
    }
}

//// Schema ////

type StringSubValidators = Readonly<{
    casing: Casing
    endsWith: EndsWith
    includes: Includes
    startsWith: StartsWith
    trim: Trimmed
}>

//// Implementation ////

class String extends TypeSchema<StringValidator, StringSubValidators> {

    constructor() {
        super(
            new StringValidator, 
            {
                casing: new Casing,

                startsWith: new StartsWith,
                endsWith: new EndsWith,

                includes: new Includes,
                trim: new Trimmed,
            }
        )
    }

    //// Sub Validator Interface ////

    camel(...sig: NameMessageEnabledSettingsSignature<string>): this {
        return this._applyCasing('camel', sig)
    }

    lower(...sig: NameMessageEnabledSettingsSignature<string>): this {
        return this._applyCasing('lower', sig)
    }

    upper(...sig: NameMessageEnabledSettingsSignature<string>): this {
        return this._applyCasing('upper', sig)
    }

    capitalize(...sig: NameMessageEnabledSettingsSignature<string>): this {
        return this._applyCasing('capitalize', sig)
    }
    
    startsWith(...sig: StringValueSettingsSignature): this {
        return this._applyStringValue('startsWith', sig)
    }

    endsWith(...sig: StringValueSettingsSignature): this {
        return this._applyStringValue('endsWith', sig)
    }

    includes(...sig: StringValueSettingsSignature): this {
        return this._applyStringValue('includes', sig)
    }

    trim(...sig: NameMessageEnabledSettingsSignature<string>): this {
        const settings = toNameMessageEnabledSettings(...sig)
        return this._applySubValidator('trim', settings)
    }

    // TODO 
    // formats: email | url

    //// Helper ////

    protected _applyCasing(
        casing: Casing['casing'], 
        sig: NameMessageEnabledSettingsSignature<string>
    ) {
        const settings = { casing, ...toNameMessageEnabledSettings(...sig) }
        return this._applySubValidator('casing', settings)
    }

    protected _applyStringValue(
        type: 'startsWith' | 'endsWith' | 'includes',
        sig: StringValueSettingsSignature
    ) {
        const settings = toStringValueSettings(...sig)
        return this._applySubValidator(type, settings)
    }

}

//// Exports ////

export { String }

export const $string = new String()