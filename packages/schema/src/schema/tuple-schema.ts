
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema, { Primitive, SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type TupleSchemaInput = readonly (Primitive | Schema<any, any, any>)[]

type TupleSchemaOutput<T extends TupleSchemaInput> = {
    [K in keyof T]: T[K] extends Primitive
    /**/ ? T[K]
    /**/ : T[K] extends Schema<any, any, any>
        // @ts-expect-error T[K] is resolving to Schema<any,any, any> & T[K], which I don't get
        /**/ ? SchemaOutput<T[K]>
        /**/ : unknown
}

/*** Main ***/

class TupleSchema<
    I extends TupleSchemaInput,
    O extends TupleSchemaOutput<I>,
    F extends Flags[] = []
/**/> extends Schema<I, HasMutable<F, O, Readonly<O>>, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => TupleSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => TupleSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => TupleSchema<I, O>

}

/*** Expors ***/

export default TupleSchema

export {
    TupleSchema,
    TupleSchemaInput,
    TupleSchemaOutput
}