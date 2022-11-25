import { typeSchema, TypeSchema } from './type'

//// Type ////

interface NumberSchema extends TypeSchema<number> {}

//// Boolean ////

const number: NumberSchema = typeSchema({

    name: 'number',

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

})

//// Exports ////

export default number

export {
    number,
    NumberSchema
}