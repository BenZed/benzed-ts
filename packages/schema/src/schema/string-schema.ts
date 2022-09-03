
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema from './schema'

/*** Main ***/

class StringSchema<F extends Flags[] = []> extends Schema<string, F> {

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => StringSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => StringSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => StringSchema

}

/*** Expors ***/

export default StringSchema

export {
    StringSchema
}