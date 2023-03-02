import { ValidationErrorMessage, Validator } from '@benzed/schema'
import { SignatureParser } from '@benzed/signature-parser'
import { define, isString, pick } from '@benzed/util'

import { SubContractValidator } from '../../../validators'
import { toNameMessageEnabledSettings } from '../../util'

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

    readonly value: string = ''

    get [Validator.state](): Pick<this, 'value' | 'name' | 'message' | 'enabled'> {
        return pick(this, 'value', 'name', 'message', 'enabled')
    }

    set [Validator.state](state: Pick<this, 'value' | 'name' | 'message' | 'enabled'>) {
        define.named(state.name, this)
        define.hidden(this, 'message', state.message)
        define.enumerable(this, 'enabled', state.enabled)
        define.enumerable(this, 'value', state.value)
    }
    
}