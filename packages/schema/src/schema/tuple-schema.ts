
import { Flags, HasReadonly, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type TupleSchemaInput = readonly Schema<any, any>[]
type TupleSchemaOutput<T extends TupleSchemaInput> = {
    [K in keyof T]: SchemaOutput<T[K]>
}

/*** Main ***/

class TupleSchema<T, F extends Flags[]> extends Schema<T, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => TupleSchema<T, [...F, Flags.Optional]>
    >

    public override readonly readonly!: HasReadonly<
    /**/ F, never, () => TupleSchema<T, [...F, Flags.Readonly]>
    >

}

/*** Expors ***/

export default TupleSchema

export {
    TupleSchema,
    TupleSchemaInput,
    TupleSchemaOutput
}