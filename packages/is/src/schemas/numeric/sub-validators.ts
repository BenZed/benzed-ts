import { ceil, floor, round } from '@benzed/math'
import { ContractValidator, isValidationErrorMessage, ValidationErrorMessage, Validator } from '@benzed/schema'
import { SignatureParser } from '@benzed/signature-parser'

import { isBoolean, isFinite, isNumber, isOptional, isString, pick } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

// TODO Move me
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

export type NameMessageEnabledSettingsSignature = [
    enabled?: boolean
] | [
    message?: string | ValidationErrorMessage<number>,
    name?: string
]

export const toPrecisionSettings = new SignatureParser({
    by: isOptional(isNumber),
    ...toNameMessageEnabledSettings.types
})
    .setDefaults({
        enabled: true as boolean
    })
    .addLayout('enabled')
    .addLayout('by', 'message', 'name')

export type PrecisionSettingsSignature = [
    enabled?: boolean
] | [
    by?: number, 
    message?: string | ValidationErrorMessage<number>,
    name?: string
]

//// Helper ////

abstract class Precision extends ContractValidator<number> {

    constructor(readonly by: number) {
        super()
    }

    readonly enabled: boolean = false

    override message(): string {
        const detail = this.by === 1 ? '' : ` by ${this.by}`
        return `must be ${this.name.toLowerCase()}ed${detail}`
    }

    get [Validator.state](): Pick<this, 'name' | 'enabled' | 'by' | 'message'> {
        return pick(this, 'name', 'enabled', 'by', 'message')
    }

}

//// Exports ////

export class Round extends Precision {
    override transform(input: number): number {
        return round(input, this.by)
    }
}

export class Ceil extends Precision {
    override transform(input: number): number {
        return ceil(input, this.by)
    }
}

export class Floor extends Precision {
    override transform(input: number): number {
        return floor(input, this.by)
    }
}

export class Finite extends ContractValidator<number> {

    readonly enabled: boolean = false

    override isValid(input: number): boolean {
        return isFinite(input)
    }

}