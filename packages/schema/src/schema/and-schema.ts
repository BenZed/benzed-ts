import { Schema, SchemaInput } from './schema'

/*** Types ***/

type Intersect<T> = T extends [infer First, ...infer Rest]
    ? First & Intersect<Rest>
    : unknown

/*** Main ***/

class AndSchema<T> extends Schema<T> {
    public constructor (...input: SchemaInput[]) {
        super()
        void input
    }
}

/*** Exports ***/

export default AndSchema

export {
    AndSchema,
    Intersect
}