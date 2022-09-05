
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/
/*** Types ***/

type RecordSchemaInput = Schema<any, any, any>
type RecordSchemaOutput<T extends RecordSchemaInput> =
    HasMutable<
    /**/ T,
    /**/ { [key: string]: SchemaOutput<T> },
    /**/ { readonly [key: string]: SchemaOutput<T> }
    >

/*** Main ***/

class RecordSchema<
    /**/

    I extends RecordSchemaInput,
    O extends RecordSchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends Schema<I, O, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => RecordSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => RecordSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => RecordSchema<I, O>

}

/*** Expors ***/

export default RecordSchema

export {
    RecordSchema,
    RecordSchemaInput,
    RecordSchemaOutput
}