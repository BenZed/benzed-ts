
import { isArray, isNumber, isString } from '@benzed/is'

import {
    FormatValidator,
    FormatValidatorSettingsShortcut,
    toFormatValidatorSettings
} from '../validator/format'

import {
    TrimValidator,
    TrimValidatorSettings
} from '../validator/trim'

import {
    TypeValidator,
} from '../validator/type'

import {
    Casing,
    CaseValidator,
    CaseValidatorSettingsShortcut,
    toCaseValidatorSettings
} from '../validator/case'

import {
    AddFlag,
    Flags,
    HasMutable,
    HasOptional
} from './flags'

import {
    PrimitiveSchema
} from './schema'
import { 
    LengthValidator,
    LengthValidatorSettingsShortcut, 
    toLengthValidatorSettings 
} from '../validator/length'

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

    protected _typeValidator = new TypeValidator({
        name: 'string',
        article: 'a',
        is: isString,
        cast: tryCastToString
    })

    public constructor (...flags: F) {
        super('', ...flags)
    }

    /*** Chain Schema Methods ***/

    public trim(settings?: TrimValidatorSettings): this {
        return this._copyWithPostTypeValidator('trim', new TrimValidator({ ...settings }))
    }

    public format(...input: FormatValidatorSettingsShortcut): this {
        return this._copyWithPostTypeValidator('format', new FormatValidator(
            toFormatValidatorSettings(input)
        ))
    }

    public upperCase(...input: CaseValidatorSettingsShortcut<'upper'>): this {
        return this._copyWithCaseValidator(input, 'upper')
    }

    public lowerCase(...input: CaseValidatorSettingsShortcut<'lower'>): this {
        return this._copyWithCaseValidator(input, 'lower')
    }

    public camelCase(...input: CaseValidatorSettingsShortcut<'camel'>): this {
        return this._copyWithCaseValidator(input, 'camel')
    }

    public pascalCase(...input: CaseValidatorSettingsShortcut<'pascal'>): this {
        return this._copyWithCaseValidator(input, 'pascal')
    }

    public dashCase(...input: CaseValidatorSettingsShortcut<'dash'>): this {
        return this._copyWithCaseValidator(input, 'dash')
    }

    public capitalize(...input: CaseValidatorSettingsShortcut<'capital'>): this {
        return this._copyWithCaseValidator(input, 'capital')
    }

    public length(...input: LengthValidatorSettingsShortcut): this {
        const settings = toLengthValidatorSettings(input)
        return this._copyWithPostTypeValidator('length', new LengthValidator(settings))
    }

    public default(defaultValue = ''): this {
        return super.default(defaultValue)
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

    /*** CopyComparable ***/

    protected _copyWithCaseValidator<C extends Casing>(
        input: CaseValidatorSettingsShortcut<C>,
        casing: C
    ): this {
        const settings = toCaseValidatorSettings(input, casing)

        return this._copyWithPostTypeValidator('case',
            new CaseValidator(settings)
        )
    }

}

/*** Expors ***/

export default StringSchema

export {
    StringSchema
}