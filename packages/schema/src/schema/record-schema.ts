
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/
/*** Types ***/

type RecordSchemaInput = Schema<any, any>
type RecordSchemaOutput<T extends RecordSchemaInput> = SchemaOutput<T>

/*** Main ***/

class RecordSchema<T, F extends Flags[] = []> extends Schema<{ [key: string]: T }, F> {

    private readonly _input: RecordSchemaInput

    public constructor (input: RecordSchemaInput, ...flags: F) {
        super(...flags)
        this._input = input
    }

    public override readonly optional!: HasOptional<
    /**/ F, never, () => RecordSchema<T, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => RecordSchema<T, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => RecordSchema<T>

}

/*** Expors ***/

export default RecordSchema

export {
    RecordSchema,
    RecordSchemaInput,
    RecordSchemaOutput
}