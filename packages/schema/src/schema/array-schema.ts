
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type ArraySchemaInput = Schema<any, any, any>
type ArraySchemaOutput<T extends ArraySchemaInput> = SchemaOutput<T>[]

/*** Main ***/

class ArraySchema<

    I extends ArraySchemaInput,
    O extends ArraySchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends Schema<I, HasMutable<F, O, Readonly<O>>, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => ArraySchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => ArraySchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => ArraySchema<I, O>

}

/*** Expors ***/

export default ArraySchema

export {
    ArraySchema,
    ArraySchemaInput,
    ArraySchemaOutput
}