
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import { PrimitiveSchema } from './schema'

/*** Main ***/

class NumberSchema<F extends Flags[] = []> extends PrimitiveSchema<number, F> {

    public constructor (def = 0, ...flags: F) {
        super(def, ...flags)
    }

    public override readonly optional!: HasOptional<
    /**/ F, never, () => NumberSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => NumberSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => NumberSchema

}

/*** Expors ***/

export default NumberSchema

export {
    NumberSchema
}