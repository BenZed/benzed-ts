
import { Flags, HasMutable, HasOptional } from './flags'

import Schema from './schema'

/*** Main ***/

class NumberSchema<F extends Flags[]> extends Schema<number, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => NumberSchema<[...F, Flags.Optional]>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => NumberSchema<[...F, Flags.Mutable]>
    >

}

/*** Expors ***/

export default NumberSchema

export {
    NumberSchema
}