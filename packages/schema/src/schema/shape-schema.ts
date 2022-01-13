import { Schema, SchemaInput } from './schema'

import { Json } from '@benzed/util'

/*** Main ***/

class ShapeSchema<T extends { [key: string]: Json }> extends Schema<T> {

    public constructor (input: { [key: string]: SchemaInput }) {
        super()
        void input
    }

}

/*** Exports ***/

export default ShapeSchema

export {
    ShapeSchema
}