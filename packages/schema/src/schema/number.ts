
import { is } from '@benzed/is'

import {
    Flags,
    AddFlag,
    HasMutable,
    HasOptional
} from './flags'

import {
    TypeValidator
} from '../validator/type'

import {
    RangeValidator,
    RangeValidatorSettingsShortcut,
    toRangeValidatorSettings,
} from '../validator/range'

import {
    RoundValidator,
    RoundValidatorSettingsShortcut,
    toRoundValidatorSettings,
    RounderMethod
} from '../validator/round'

import { PrimitiveSchema } from './schema'

//// Helper ////

function tryCastToNumber(value: unknown): unknown {
    if (is.string(value)) {
        const parsed = parseFloat(value)
        if (!is.nan(parsed))
            return parsed
    }

    return value
}

//// Main ////

class NumberSchema<F extends Flags[] = []> extends PrimitiveSchema<number, F> {

    //// Constructor ////

    constructor (...flags: F) {
        super(0, ...flags)
    }

    //// Schema Implementation ////

    protected _typeValidator = new TypeValidator({
        name: 'number',
        article: 'a',
        is: is.number,
        cast: tryCastToNumber
    })

    //// Chain Methods ////

    range(...input: RangeValidatorSettingsShortcut<number>): this {
        return this._copyWithPostTypeValidator(
            'range',
            new RangeValidator(
                toRangeValidatorSettings(input)
            )
        )
    }

    round(...input: RoundValidatorSettingsShortcut): this {
        return this._copyWithRounderValidator('round', input)
    }

    floor(...input: RoundValidatorSettingsShortcut): this {
        return this._copyWithRounderValidator('floor', input)
    }

    ceil(...input: RoundValidatorSettingsShortcut): this {
        return this._copyWithRounderValidator('ceil', input)
    }

    override default(defaultValue: number | (() => number) = 0): this {
        return super.default(defaultValue)
    }

    //// Private Chain Methods ////

    private _copyWithRounderValidator(
        rounder: RounderMethod,
        input: RoundValidatorSettingsShortcut
    ): this {
        return this._copyWithPostTypeValidator(
            'rounder',
            new RoundValidator(
                toRoundValidatorSettings(
                    rounder,
                    input
                )
            )
        )
    }
}

interface NumberSchema<F extends Flags[] = []> {

    readonly optional: HasOptional<
    /**/ F, never, NumberSchema<AddFlag<Flags.Optional, F>>
    >

    readonly mutable: HasMutable<
    /**/ F, never, NumberSchema<AddFlag<Flags.Mutable, F>>
    >

    readonly clearFlags: () => NumberSchema

}

//// Expors ////

export default NumberSchema

export {
    NumberSchema
}