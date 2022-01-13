import { Schema, SchemaInput } from './schema'

import { Json } from '@benzed/util'

/*** Main ***/

class AndSchema<T extends Json> extends Schema<T> {
    public constructor (left: SchemaInput, right: SchemaInput) {
        super()
        void left
        void right
    }
}

/*** Exports ***/

export default AndSchema

export {
    AndSchema
}