import { ContractValidator, SubValidator, ValidationContext, ValidationErrorMessage, Validator } from '@benzed/schema'
import { SignatureParser } from '@benzed/signature-parser'
import { isBigInt, isBoolean, isNumber, isOptional, isUnion, nil, omit, pick } from '@benzed/util'
import { toNameMessageEnabledSettings } from '../../../util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Settings ////

export const toMultipleOfSettings = new SignatureParser({
    value: isUnion(isNumber, isBigInt),
    not: isOptional(isBoolean),
    ...omit(toNameMessageEnabledSettings.types, 'name')
})
    .setDefaults({
        enabled: true as boolean,
        not: false as boolean,
    })
    .addLayout('enabled')
    .addLayout('value', 'message', 'not')

export type MultipleOfSettings<N extends bigint | number> = {
    value: N,
    enabled: boolean,
    message?: ValidationErrorMessage<N>,
    name?: string,
    not?: boolean
}

export type MultipleOfSettingsSignature<N extends bigint | number> = [
    enabled?: boolean
] | [
    value?: N, 
    message?: ValidationErrorMessage<N>,
] | [
    {
        value: N,
        enabled: boolean,
        message?: ValidationErrorMessage<N>,
        name?: string,
        not?: boolean
    }
]

//// Exports ////

export class MultipleOf<N extends number | bigint> extends ContractValidator<N> implements SubValidator<N> {

    readonly enabled: boolean = false

    constructor(readonly value?: N, readonly not = false) {
        super()
    }

    override isValid(input: N): boolean {
        if (this.value === nil)
            return false 

        const isMultipleOfValue = input % this.value === 0
    
        return this.not ? !isMultipleOfValue : isMultipleOfValue
    }

    get [Validator.state](): Pick<this, 'enabled' | 'value' | 'not' | 'name' | 'message'> {
        return pick(this, 'enabled', 'value', 'not', 'name', 'message')
    }

    override message(_input: N, _ctx: ValidationContext<N, N>): string {
        return `must be a multiple of ${this.value}`
    }

}
