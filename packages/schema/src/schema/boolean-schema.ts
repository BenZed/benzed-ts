
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema from './schema'

/*** Main ***/

class BooleanSchema<F extends Flags[] = []> extends Schema<boolean, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => BooleanSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => BooleanSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => BooleanSchema

}

/*** Expors ***/

export default BooleanSchema

export {
    BooleanSchema
}