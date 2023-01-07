import { isNumber, through } from '@benzed/util'
import IsType from './type'

import { 
    RangeSettingsSignature, 
    RangeValidator,
    RangeValidatorSignature,
    toRangeSettings 
} from '../validator/validators'

//// Helper ////

const toNumber = (value: unknown): unknown => {

    if (typeof value === 'string') {
        const parsed = parseFloat(value)
        if (!Number.isNaN(parsed))
            return parsed
    }

    return value
}

//// Boolean ////

class IsNumber extends IsType<number> {

    constructor() {
        super({
            type: 'number',
            is: isNumber,
            cast: toNumber
        })
    }

    range: RangeValidatorSignature<this> = (...args: RangeSettingsSignature) => {
        const settings = toRangeSettings(args)
        return this._setValidatorByType(RangeValidator, () => new RangeValidator(settings))
    }

    get finite(): this {
        return this.asserts(isFinite, 'Must be finite', 'is-finite')
    }

    get infinite(): this {
        return this.transforms(through, 'is-finite')
    }

}

//// Exports ////

export default IsNumber

export {
    IsNumber
}