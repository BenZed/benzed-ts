import {
    isNumber as _isNumber,
    isString,
    isNaN,
    nil,
} from '@benzed/util'

import { 
    RangeSettings,
    RangeSettingsSignature, 
    RangeValidator,
    toRangeSettings
} from '@benzed/is/src/validators'

import Numeric from './numeric'

//// Helper ////

const toNumber = (value: unknown): unknown => {

    if (isString(value)) {
        const parsed = parseFloat(value)
        if (!isNaN(parsed))
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
        return this._setRangeValidator(settings)
    }

    above(value: number): this {
        return this._setRangeValidator({ comparator: '>', value })
    }

    below(value: number): this {
        return this._setRangeValidator({ comparator: '<', value })
    }

    equalOrBelow(value: number): this {
        return this._setRangeValidator({ comparator: '<=', value })
    }

    equalOrAbove(value: number): this {
        return this._setRangeValidator({ comparator: '>=', value })
    }

    between(min: number, max: number): this {
        return this._setRangeValidator({ min, comparator: '..', max })
    }

    // 

    protected _setRangeValidator(settings: RangeSettings): this {
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