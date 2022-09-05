import { Intersect } from '@benzed/util'

import { AddFlag, Flags, HasMutable, HasOptional } from './flags'
import { Schema, SchemaOutput } from './schema'

/* eslint-disable  @typescript-eslint/no-explicit-any */

/*** Types ***/

type IntersectionSchemaInput = readonly Schema<object, any>[]

type IntersectionSchemaOutput<T extends IntersectionSchemaInput> =
    Intersect<{
        [K in keyof T]: SchemaOutput<T[K]>
    }>

/*** Main ***/

class IntersectionSchema<

    I extends IntersectionSchemaInput,
    O extends IntersectionSchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends Schema<I, O, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => IntersectionSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => IntersectionSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => IntersectionSchema<I, O>

}

/*** Expors ***/

export default IntersectionSchema

export {
    IntersectionSchema,
    IntersectionSchemaInput,
    IntersectionSchemaOutput
}