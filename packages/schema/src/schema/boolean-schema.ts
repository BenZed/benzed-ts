
import { Flags, HasMutable, HasOptional } from './flags'

import Schema from './schema'

/*** Main ***/

class BooleanSchema<F extends Flags[]> extends Schema<boolean, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => BooleanSchema<[...F, Flags.Optional]>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => BooleanSchema<[...F, Flags.Mutable]>
    >

}

/*** Expors ***/

export default BooleanSchema

export {
    BooleanSchema
}