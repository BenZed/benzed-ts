
import { isArray, isNumber, isString } from '@benzed/is'
import { TypeValidator } from '../validator'
import {
    AddFlag,
    Flags,
    HasMutable,
    HasOptional
} from './flags'

import {
    PrimitiveSchema
} from './schema'

/*** Helper ***/

function tryCastToString(value: unknown): unknown {

    if (isNumber(value))
        return value.toString()

    if (isArray(value))
        return value.join()

    return value
}

/*** Main ***/

class StringSchema<F extends Flags[] = []> extends PrimitiveSchema<string, F> {

    public constructor (def = '', ...flags: F) {
        super(def, ...flags)
    }

    protected _typeValidator = new TypeValidator({
        name: 'string',
        is: isString,
        cast: tryCastToString
    })

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