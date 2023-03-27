import { TypeValidator } from '@benzed/schema'

import {
    isNumber,
    isString,
    isNaN,
} from '@benzed/util'

import { 
    NameMessageEnabledSettingsSignature, 
    toNameMessageEnabledSettings 
} from '../../util'

import { Numeric } from './numeric'

import {

    Round,
    Finite,

    toRoundSettings,
    RoundSettingsSignature,

} from './sub-validators'

//// Helper ////

class NumberValidator extends TypeValidator<number> {

    isValid(input: unknown): input is number {
        return isNumber(input)
    }

    override cast(value: unknown) {

        if (isString(value)) {
            const parsed = parseFloat(value)
            if (!isNaN(parsed))
                return parsed
        }

        return value
    }

}

//// Exports ////

export class Number extends Numeric<number, { round: Round, finite: Finite }> {

    constructor() {
        super(
            new NumberValidator,
            {
                round: new Round,
                finite: new Finite
            }
        )
    }

    get _two(): number {
        return 2
    }

    round(...params: RoundSettingsSignature): this {
        const settings = toRoundSettings(...params)
        return this._applySubValidator('round', { ...settings, type: 'round' })
    }

    ceil(...params: RoundSettingsSignature): this {
        const settings = toRoundSettings(...params)
        return this._applySubValidator('round', { ...settings, type: 'ceil' })
    }

    floor(...params: RoundSettingsSignature): this {
        const settings = toRoundSettings(...params)
        return this._applySubValidator('round', { ...settings, type: 'floor' })
    }

    finite(...params: NameMessageEnabledSettingsSignature<number>): this {
        const settings = toNameMessageEnabledSettings(...params)
        return this._applySubValidator('finite', settings)
    }

}

export const $number = new Number