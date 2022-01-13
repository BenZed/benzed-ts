import { Schema, SchemaInput } from './schema'

import { Json } from '@benzed/util'

/*** Main ***/

class TupleSchema<T extends readonly Json[]> extends Schema<T> {

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