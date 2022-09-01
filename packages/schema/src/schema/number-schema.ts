
import { Flags, HasReadonly, HasOptional } from './flags'

import Schema from './schema'

/*** Main ***/

class NumberSchema<F extends Flags[]> extends Schema<number, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => NumberSchema<[...F, Flags.Optional]>
    >

    public override readonly readonly!: HasReadonly<
    /**/ F, never, () => NumberSchema<[...F, Flags.Readonly]>
    >

}

/*** Expors ***/

export default NumberSchema

export {
    NumberSchema
}