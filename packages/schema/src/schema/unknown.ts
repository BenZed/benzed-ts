
import Schema from './schema'

import {
    Flags,
    AddFlag,
    HasMutable,
    HasOptional
} from './flags'

import { TypeValidator } from '../validator/type'

/*** Type ***/

function isUnknown(input: unknown): input is unknown {
    return true // lol
}

/*** Main ***/

class UnknownSchema<
    F extends Flags[] = []
>
    extends Schema<unknown, unknown, F> {

    protected _typeValidator = new TypeValidator<unknown>({
        name: 'unknown',
        is: isUnknown
    })

    public constructor (defaultValue?: unknown, ...flags: F) {
        super(defaultValue, ...flags)
        this._applyDefaultValue(defaultValue)
    }

    public override readonly optional!: HasOptional<
    /**/ F, never, () => UnknownSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => UnknownSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => UnknownSchema

}

/*** Expors ***/

export default UnknownSchema

export {
    UnknownSchema
}