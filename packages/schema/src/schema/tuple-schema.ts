import { Schema, SchemaInput } from './schema'

/*** Main ***/

class TupleSchema<T extends readonly unknown[]> extends Schema<T> {

    public constructor (...input: readonly SchemaInput[]) {
        super()
        void input
    }

}

/*** Exports ***/

export default TupleSchema

export {
    TupleSchema
}