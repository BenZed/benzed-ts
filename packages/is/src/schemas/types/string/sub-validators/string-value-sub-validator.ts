import { ValidationErrorMessage, Validator } from '@benzed/schema'
import { SignatureParser } from '@benzed/signature-parser'
import { isString, pick } from '@benzed/util'

import { SubContractValidator } from '../../../../validators'
import { toNameMessageEnabledSettings } from '../../../util'

//// StringValueSubValidator Signature ////

export const toStringValueSettings = new SignatureParser({
    ...toNameMessageEnabledSettings.types,
    value: isString
})
    .setDefaults({
        ...toNameMessageEnabledSettings.defaults
    })
    .addLayout('enabled')
    .addLayout('value', 'message', 'name')

export type StringValueSettingsSignature =
    | [ enabled?: boolean ]
    | [ value: string, message?: ValidationErrorMessage<string>, name?: string ] 
    | [ settings: { value: string, message?: ValidationErrorMessage<string>, name?: string }]

//// Exports ////

export abstract class StringValueSubValidator extends SubContractValidator<string> {

    //// Settings ////
    
    readonly value: string = ''

    //// Validator Implementation ////
    
    get [Validator.state](): Pick<this, 'value' | 'name' | 'message' | 'enabled'> {
        return pick(this, 'value', 'name', 'message', 'enabled')
    }
    
}