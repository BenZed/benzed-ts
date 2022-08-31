
import { Schema, SchemaInput } from './schema'

/*** Main ***/

class OrSchema<T> extends Schema<T> {

    public constructor (...input: SchemaInput[]) {
        super()
        void input
    }

}

/*** Exports ***/

export default OrSchema

export {
    OrSchema
}