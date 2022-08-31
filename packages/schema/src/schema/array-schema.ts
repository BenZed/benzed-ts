import { Schema, SchemaInput } from './schema'

/*** Main ***/

class ArraySchema<T> extends Schema<T[]> {

    public constructor (input: SchemaInput) {
        super()
        void input
    }
}

/*** Exports ***/

export default ArraySchema

export {
    ArraySchema
}