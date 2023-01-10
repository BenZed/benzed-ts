import {
    isNumber as _isNumber,
    isString,
    nil,
} from '@benzed/util'

import { 

    RangeSettingsSignature, 
    RangeValidator,
    RangeValidatorSignature,
    toRangeSettings

} from '../../../../validator/validators'

import IsNumeric from './is-numeric'

//// Helper ////

const toNumber = (value: unknown): unknown => {

    if (isString(value)) {
        const parsed = parseFloat(value)
        if (!Number.isNaN(parsed))
            return parsed
    }

    return value
}

//// Boolean ////

class IsNumber extends IsNumeric<number> {

    constructor() {
        super({
            type: 'number',
            is: _isNumber,
            cast: toNumber
        })
    }

    get finite(): this {
        return this.asserts(isFinite, 'Must be finite', 'is-finite')
    }

    get infinite(): this {
        return this._setValidatorById('is-infinite', nil)
    }

    range: RangeValidatorSignature<this> = (...args: RangeSettingsSignature) => {
        const settings = toRangeSettings(args)
        return this._setValidatorByType(
            RangeValidator, 
            () => new RangeValidator(settings)
        )
    }

}

//// Exports ////

export default IsNumber

export {
    IsNumber
}

export const isNumber = new IsNumber()