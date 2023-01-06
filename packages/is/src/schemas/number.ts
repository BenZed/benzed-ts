import { RangeValidator, RangeValidatorSignature, RangeSettingsSignature, toRangeSettings } from '../validators/range'
import Schema from '../schema/schema'
import { typeSchema, TypeSchema } from './type'
import { isNumber } from '@benzed/util'

//// Type ////

interface NumberSchema extends TypeSchema<number> {
    range: RangeValidatorSignature<this>
}

//// Boolean ////

class NumberSchema extends Schema<number> {

    constructor() {
        super({
            type: 'number',
            is: isNumber
        })
    }

    is(input: unknown): input is number {
        return typeof input === 'number' && 
            !Number.isNaN(input) && 
            Number.isFinite(input)
    }

    cast(value: unknown): unknown {

        if (typeof value === 'string') {
            const parsed = parseFloat(value)
            if (!Number.isNaN(parsed))
                return parsed
        }
    
        return value
    }

}

//// Exports ////

export default number

export {
    number,
    NumberSchema
}