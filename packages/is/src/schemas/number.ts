import { isNumber, through } from '@benzed/util'
import TypeSchema from './type'
import { RangeSettingsSignature, RangeValidator, RangeValidatorSignature, toRangeSettings } from '../validators'

//// Helper ////

const castToNumber = (value: unknown): unknown => {

    if (typeof value === 'string') {
        const parsed = parseFloat(value)
        if (!Number.isNaN(parsed))
            return parsed
    }

    return value
}

//// Boolean ////

class NumberSchema extends TypeSchema<number> {

    constructor() {
        super({
            type: 'number',
            is: isNumber,
            cast: castToNumber
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

export default NumberSchema

export {
    NumberSchema
}