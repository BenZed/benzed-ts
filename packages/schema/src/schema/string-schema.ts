
import { Flags, HasMutable, HasOptional } from './flags'

import Schema from './schema'

/*** Main ***/

class StringSchema<F extends Flags[]> extends Schema<string, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => StringSchema<[...F, Flags.Optional]>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => StringSchema<[...F, Flags.Mutable]>
    >

}

/*** Expors ***/

export default StringSchema

export {
    StringSchema
}