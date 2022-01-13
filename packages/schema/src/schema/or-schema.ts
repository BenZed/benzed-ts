
import { Schema, SchemaInput } from './schema'

import { Json } from '@benzed/util'

/*** Main ***/

class OrSchema<T extends Json> extends Schema<T> {

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