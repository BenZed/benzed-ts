import { TypeSchema } from '@benzed/schema'
import {
    isNumber,
    isString,
    isNaN,
} from '@benzed/util'

import NumericValidator from './numeric'
import { 

    Round, 
    Ceil, 
    Finite, 
    Floor, 

    toPrecisionSettings,
    PrecisionSettingsSignature,

    toNameMessageEnabledSettings, 
    NameMessageEnabledSettingsSignature

} from './sub-validators'

//// Helper ////

class NumberValidator extends NumericValidator<number> {

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

export class Number 
    extends TypeSchema<

    NumberValidator, 
    {
        round: Round
        ceil: Ceil
        floor: Floor
        finite: Finite
    }

    > {

    constructor() {
        super(
            new NumberValidator,
            {
                round: new Round(1),
                ceil: new Ceil(1),
                floor: new Floor(1),
                finite: new Finite
            }
        )
    }

    round(...params: PrecisionSettingsSignature): this {
        const settings = toPrecisionSettings(...params)
        return this._applySubValidator('round', settings)
    }

    ceil(...params: PrecisionSettingsSignature): this {
        const settings = toPrecisionSettings(...params)
        return this._applySubValidator('ceil', settings)
    }

    floor(...params: PrecisionSettingsSignature): this {
        const settings = toPrecisionSettings(...params)
        return this._applySubValidator('floor', settings)
    }

    finite(...params: NameMessageEnabledSettingsSignature): this {
        const settings = toNameMessageEnabledSettings(...params)
        return this._applySubValidator('finite', settings)
    }

}

export const $number = new Number