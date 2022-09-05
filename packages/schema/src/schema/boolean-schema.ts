
import { isBoolean } from '@benzed/is'
import { TypeValidator } from '../validator'
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import { PrimitiveSchema } from './schema'

/*** Helper ***/

function tryCastToBoolean(value: unknown): unknown {

    if (value === 'true' || value === 1)
        return true

    if (value === 'false' || value === 0)
        return false

    return value
}

/*** Main ***/

class BooleanSchema<F extends Flags[] = []> extends PrimitiveSchema<boolean, F> {

    protected _typeValidator = new TypeValidator({
        name: 'boolean',
        is: isBoolean,
        cast: tryCastToBoolean
    })

    public constructor (def = false, ...flags: F) {
        super(def, ...flags)
    }

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