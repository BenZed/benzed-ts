import { typeSchema, TypeSchema } from './type'

//// Types ////

interface BooleanSchema extends TypeSchema<boolean> {}

//// Boolean ////

const boolean: BooleanSchema = typeSchema({

    name: 'boolean',

    assert(input: unknown): input is boolean {
        return typeof input === 'boolean'
    },

    cast(value: unknown): unknown {

        if (value === 'true' || value === 1)
            return true

        if (value === 'false' || value === 0)
            return false

        return value
    }

})

//// Exports ////

export default boolean

export {
    boolean,
    BooleanSchema
}