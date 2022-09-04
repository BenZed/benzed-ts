
import {
    AddFlag,
    Flags,
    HasMutable,
    HasOptional
} from './flags'

import {
    PrimitiveSchema
} from './schema'

/*** Main ***/

class StringSchema<F extends Flags[] = []> extends PrimitiveSchema<string, F> {

    public constructor (def = '', ...flags: F) {
        super(def, ...flags)
    }

    public override readonly optional!: HasOptional<
    /**/ F,
    /**/ () => never,
    /**/ () => StringSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F,
    /**/ () => never,
    /**/ () => StringSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => StringSchema

}

/*** Expors ***/

export default StringSchema

export {
    StringSchema
}