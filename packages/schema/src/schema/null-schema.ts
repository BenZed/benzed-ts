
import {
    PrimitiveSchema
} from './schema'

import {
    AddFlag,
    Flags,
    HasMutable,
    HasOptional
} from './flags'

import { TypeValidator } from '../validator/type'

/*** Helper ***/

function isNull(input: unknown): input is null {
    return input === null
}

function tryCastToNull(input: unknown): unknown {
    // falsy or "null" to undefined
    return input === undefined || input === 'null'
        ? null
        : input
}

/*** Exports ***/

export default class NullSchema<F extends Flags[] = []> extends PrimitiveSchema<null, F> {

    public constructor (...flags: F) {
        super(null, ...flags)
    }

    protected _typeValidator = new TypeValidator({
        name: 'null',
        is: isNull,
        cast: tryCastToNull
    })

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => NullSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => NullSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => NullSchema

}

export {
    NullSchema
}