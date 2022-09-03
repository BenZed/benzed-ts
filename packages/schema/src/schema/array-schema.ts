
import { Flags, HasMutable, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/
/*** Types ***/

type ArraySchemaInput = Schema<any, any>
type ArraySchemaOutput<T extends ArraySchemaInput> = SchemaOutput<T>

/*** Main ***/

class ArraySchema<T, F extends Flags[]> extends Schema<T[], F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => ArraySchema<T, [...F, Flags.Optional]>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => ArraySchema<T, [...F, Flags.Mutable]>
    >

}

/*** Expors ***/

export default ArraySchema

export {
    ArraySchema,
    ArraySchemaInput,
    ArraySchemaOutput
}