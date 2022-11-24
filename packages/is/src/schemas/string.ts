
import { typeSchema, TypeSchema } from './type'

//// Type ////

interface StringSchema<S extends string> extends TypeSchema<S> {}

//// Methods ////

//// Boolean ////

const string = typeSchema({

    name: 'string',

    isType(this: StringSchema<string>, input: unknown): input is string {
        return typeof input === 'string'
    },

    cast(value: unknown): unknown {
        return value
    }

}) as StringSchema<string>

//// Exports ////

export default string

export {
    string,
    StringSchema
}