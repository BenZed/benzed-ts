import { Schema, SchemaInput } from './schema'

import { Json } from '@benzed/util'

/*** Main ***/

class ArraySchema<T extends Json> extends Schema<T[]> {

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