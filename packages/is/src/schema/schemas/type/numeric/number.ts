import {
    isNumber as _isNumber,
    isString,
    nil,
} from '@benzed/util'

import { 
    RangeSettingsSignature, 
    RangeValidator,
    toRangeSettings
} from '../../../../validator/validators'

import Numeric from './numeric'

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

class Number extends Numeric<number> {

    constructor() {
        super({
            name: 'number',
            is: _isNumber,
            cast: toNumber
        })
    }

    get finite(): this {
        return this.asserts(isFinite, 'Must be finite', 'finite')
    }

    get infinite(): this {
        return this._setValidatorById('infinite', nil)
    }

    range(...args: RangeSettingsSignature): this {
        const settings = toRangeSettings(args)
        return this._setValidatorByType(
            RangeValidator, 
            () => new RangeValidator(settings)
        )
    }

}

//// Exports ////

export default Number

export {
    Number
}

export const isNumber = new Number