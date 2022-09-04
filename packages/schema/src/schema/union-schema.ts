
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema from './schema'

import {
    TupleSchemaInput,
    TupleSchemaOutput
} from './tuple-schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type UnionSchemaInput = TupleSchemaInput
type UnionSchemaOutput<T extends UnionSchemaInput> = TupleSchemaOutput<T>[number]

/*** Main ***/

class UnionSchema<
    I extends UnionSchemaInput,
    O extends UnionSchemaOutput<I>,
    F extends Flags[] = []
    /**/> extends Schema<I, O, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => UnionSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => UnionSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => UnionSchema<I, O>

}

/*** Exports ***/

export default UnionSchema

export {
    UnionSchema,
    UnionSchemaInput,
    UnionSchemaOutput
}