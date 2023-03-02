import { SignatureParser } from '@benzed/signature-parser'
import { isBoolean, isOptional, isString } from '@benzed/util'
import { isValidationErrorMessage, ValidationErrorMessage } from '@benzed/schema'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Exports ////

export const toNameMessageEnabledSettings = new SignatureParser({
    enabled: isOptional(isBoolean),
    name: isOptional(isString),
    message: isOptional(isValidationErrorMessage<any>)
})
    .setDefaults({
        enabled: true as boolean
    })
    .addLayout('enabled')
    .addLayout('message', 'name')

export type NameMessageEnabledSettingsSignature<T> = [
    enabled?: boolean
] | [
    message?: ValidationErrorMessage<T>,
    name?: string
] 