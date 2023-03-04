import { ceil, floor, round } from '@benzed/math'
import { ContractValidator, SubValidator, ValidationErrorMessage, Validator } from '@benzed/schema'
import { SignatureParser } from '@benzed/signature-parser'

import { isNumber, isOptional, pick } from '@benzed/util'
import { toNameMessageEnabledSettings } from '../../../util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

const ROUNDERS = {
    floor,
    ceil,
    round
}

export const toRoundSettings = new SignatureParser({
    by: isOptional(isNumber),
    ...toNameMessageEnabledSettings.types
})
    .setDefaults({
        enabled: true as boolean,
    })
    .addLayout('enabled')
    .addLayout('by', 'message', 'name')

export type RoundSettingsSignature = [
    enabled?: boolean
] | [
    by?: number, 
    message?: string | ValidationErrorMessage<number>,
    name?: string
]

//// Helper ////

export class Round extends ContractValidator<number> implements SubValidator<number> {

    readonly enabled: boolean = false

    readonly by: number = 1 

    readonly type: 'round' | 'ceil' | 'floor' = 'round'

    override message(): string {
        const detail = this.by === 1 ? '' : ` by ${this.by}`
        return `must be ${this.name.toLowerCase()}ed${detail}`
    }

    override transform(input: number): number {
        return ROUNDERS[this.type](input, this.by)
    }

    get [Validator.state](): Pick<this, 'name' | 'enabled' | 'by' | 'type' | 'message'> {
        return pick(this, 'name', 'enabled', 'by', 'type', 'message')
    }

}