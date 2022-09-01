
import { Flags, HasReadonly, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/
/*** Types ***/

type RecordSchemaInput = Schema<any, any>
type RecordSchemaOutput<T extends RecordSchemaInput> = SchemaOutput<T>

/*** Main ***/

class RecordSchema<T, F extends Flags[]> extends Schema<{ [key: string]: T }, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => RecordSchema<T, [...F, Flags.Optional]>
    >

    public override readonly readonly!: HasReadonly<
    /**/ F, never, () => RecordSchema<T, [...F, Flags.Readonly]>
    >

}

/*** Expors ***/

export default RecordSchema

export {
    RecordSchema,
    RecordSchemaInput,
    RecordSchemaOutput
}