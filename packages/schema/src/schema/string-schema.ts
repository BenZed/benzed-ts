
import { Flags, HasReadonly, HasOptional } from './flags'

import Schema from './schema'

/*** Main ***/

class StringSchema<F extends Flags[]> extends Schema<string, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => StringSchema<[...F, Flags.Optional]>
    >

    public override readonly readonly!: HasReadonly<
    /**/ F, never, () => StringSchema<[...F, Flags.Readonly]>
    >

}

/*** Expors ***/

export default StringSchema

export {
    StringSchema
}