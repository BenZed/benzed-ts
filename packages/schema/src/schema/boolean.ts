
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'
import { PrimitiveSchema } from './schema'

import { TypeValidator } from '../validator/type'

import { isBoolean } from '@benzed/is'

//// Helper ////

function tryCastToBoolean(value: unknown): unknown {

    if (value === `true` || value === 1)
        return true

    if (value === `false` || value === 0)
        return false

    return value
}

//// Main ////

class BooleanSchema<F extends Flags[] = []> extends PrimitiveSchema<boolean, F> {

    protected _typeValidator = new TypeValidator({
        name: `boolean`,
        article: `a`,
        is: isBoolean,
        cast: tryCastToBoolean
    })

    constructor (...flags: F) {
        super(false, ...flags)
    }

    override readonly optional!: HasOptional<
    /**/ F, never, BooleanSchema<AddFlag<Flags.Optional, F>>
    >

    override readonly mutable!: HasMutable<
    /**/ F, never, BooleanSchema<AddFlag<Flags.Mutable, F>>
    >

    override readonly clearFlags!: () => BooleanSchema

    override default(defaultValue = false): this {
        return super.default(defaultValue)
    }
}

//// Expors ////

export default BooleanSchema

export {
    BooleanSchema
}