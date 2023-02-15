import { 
    $$settings, 
    isValidationErrorMessage, 
    SubContractValidator as StatelessSubValidator,
    ValidationContext,
    ValidationErrorMessage
} from '@benzed/schema'

import { isBoolean, isOptional, isString, pick, SignatureParser } from '@benzed/util'

import { SettingsValidator } from '.'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Signature Helpers ////

export const toNameMessage = new SignatureParser({
    message: isOptional(isValidationErrorMessage<any>),
    name: isOptional(isString)
}).addLayout('message', 'name')

export type NameMessageSignature<T> = 
    | [ message?: ValidationErrorMessage<T>, name?: string ] 
    | [ settings: { message?: ValidationErrorMessage<T>, name?: string }]

export const toNameMessageEnabled = new SignatureParser({
    ...toNameMessage.types,
    enabled: isOptional(isBoolean)
})
    .setDefaults({ enabled: true as boolean })
    .addLayout('enabled')
    .addLayout('message', 'name')

export type NameMessageEnabledSignature<T> = 
    | NameMessageSignature<T> 
    | [enabled?: boolean]

//// Exports ////

export class SubValidator<T> extends StatelessSubValidator<T> implements SettingsValidator<T,T> {

    //// State ////
    
    readonly enabled: boolean = false

    override readonly name = this.constructor.name

    message(ctx: ValidationContext<T>): string {
        void ctx
        return `Must be ${this.name}`
    }

    //// Settings ////
    
    get [$$settings](): Pick<this, 'name' | 'message' | 'enabled'> {
        return pick(this, 'name', 'message', 'enabled')
    }
}