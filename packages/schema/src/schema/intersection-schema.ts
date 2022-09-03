import { Intersect } from '@benzed/util'

import { Flags, HasMutable, HasOptional } from './flags'
import { Schema, SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type IntersectionSchemaInput = readonly Schema<object, any>[]
type IntersectionSchemaOutput<T extends IntersectionSchemaInput> = Intersect<{
    [K in keyof T]: SchemaOutput<T[K]>
}>

/*** Main ***/

class IntersectionSchema<T, F extends Flags[]> extends Schema<T, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => IntersectionSchema<T, [...F, Flags.Optional]>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => IntersectionSchema<T, [...F, Flags.Mutable]>
    >

}

/*** Expors ***/

export default IntersectionSchema

export {
    IntersectionSchema,
    IntersectionSchemaInput,
    IntersectionSchemaOutput
}