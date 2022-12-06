import { RangeValidator, RangeValidatorSignature, RangeSettingsSignature, toRangeSettings } from '../validators/range'
import { typeSchema, TypeSchema } from './type'

//// Type ////

interface NumberSchema extends TypeSchema<number> {
    range: RangeValidatorSignature<this>
}

//// Boolean ////

const number: NumberSchema = typeSchema({

    type: 'number',

    assert(input: unknown): input is number {
        return typeof input === 'number' && 
            !Number.isNaN(input) && 
            Number.isFinite(input)
    },

    cast(value: unknown): unknown {

        if (typeof value === 'string') {
            const parsed = parseFloat(value)
            if (!Number.isNaN(parsed))
                return parsed
        }
    
        return value
    }

}).extend({

    range(this: NumberSchema, ...args: RangeSettingsSignature) {

        const settings = toRangeSettings(args)

        return this.validates(new RangeValidator(settings), settings.comparator)

    }

})

//// Exports ////

export default number

export {
    number,
    NumberSchema
}