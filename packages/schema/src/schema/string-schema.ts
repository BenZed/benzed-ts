
import { isArray, isNumber, isString } from '@benzed/is'

import {
    FormatValidator,
    FormatValidatorSettingsShortcut,
    toFormatValidatorSettings,
    TrimValidator,
    TrimValidatorSettings,
    TypeValidator
} from '../validator'

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

    /*** Chain Schema Methods ***/

    public trim(settings?: TrimValidatorSettings): this {
        return this._copyWithPostTypeValidator('trim', new TrimValidator({ ...settings }))
    }

    public format(...input: FormatValidatorSettingsShortcut): this {
        return this._copyWithPostTypeValidator('format', new FormatValidator(
            toFormatValidatorSettings(input)
        ))
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