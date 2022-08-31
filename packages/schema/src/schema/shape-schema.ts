import { Schema, SchemaInput } from './schema'

/*** Main ***/

class ShapeSchema<T extends { [key: string]: unknown }> extends Schema<T> {

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