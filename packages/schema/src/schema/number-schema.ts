
import { isNumber, isNaN, isString } from '@benzed/is/lib'
import { TypeValidator } from '../validator'
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import { PrimitiveSchema } from './schema'

/*** Helper ***/

function tryCastToNumber(value: unknown): unknown {
    if (isString(value)) {
        const parsed = parseFloat(value)
        if (!isNaN(parsed))
            return parsed
    }

    return value
}

/*** Main ***/

class NumberSchema<F extends Flags[] = []> extends PrimitiveSchema<number, F> {

    public constructor (def = 0, ...flags: F) {
        super(def, ...flags)
    }

    protected _typeValidator = new TypeValidator({
        name: 'number',
        is: isNumber,
        cast: tryCastToNumber
    })

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