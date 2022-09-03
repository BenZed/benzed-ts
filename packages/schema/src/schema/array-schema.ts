
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type ArraySchemaInput = Schema<any, any>
type ArraySchemaOutput<T extends ArraySchemaInput> = SchemaOutput<T>

/*** Main ***/

class ArraySchema<T, F extends Flags[] = []> extends Schema<T[], F> {

    private readonly _input: ArraySchemaInput

    public constructor (input: ArraySchemaInput, ...flags: F) {
        super(...flags)
        this._input = input
    }

    public override readonly optional!: HasOptional<
    /**/ F, never, () => ArraySchema<T, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => ArraySchema<T, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => ArraySchema<T>
}

/*** Expors ***/

export default ArraySchema

export {
    ArraySchema,
    ArraySchemaInput,
    ArraySchemaOutput
}