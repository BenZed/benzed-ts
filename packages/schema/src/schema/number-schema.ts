
import { isNumber, isNaN, isString } from '@benzed/is'

import { AddFlag, Flags, HasMutable, HasOptional } from './flags'
import {
    TypeValidator,
    RangeValidator,
    RangeValidatorSettingsShortcut,
    toRangeValidatorSettings,

    RoundValidator,
    RoundValidatorSettingsShortcut,
    toRoundValidatorSettings,
    RounderMethod
} from '../validator'

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

    /*** Constructor ***/

    public constructor (def = 0, ...flags: F) {
        super(def, ...flags)
    }

    /*** Schema Implementation ***/

    protected _typeValidator = new TypeValidator({
        name: 'number',
        is: isNumber,
        cast: tryCastToNumber
    })

    /*** Chain Methods ***/

    public range(...input: RangeValidatorSettingsShortcut): this {
        return this._copyWithPostTypeValidator(
            'range',
            new RangeValidator(
                toRangeValidatorSettings(input)
            )
        )
    }

    public round(...input: RoundValidatorSettingsShortcut): this {
        return this._copyWithRounderValidator('round', input)
    }

    public floor(...input: RoundValidatorSettingsShortcut): this {
        return this._copyWithRounderValidator('floor', input)
    }

    public ceil(...input: RoundValidatorSettingsShortcut): this {
        return this._copyWithRounderValidator('ceil', input)
    }

    public override readonly optional!: HasOptional<
    /**/ F, never, () => NumberSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => NumberSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => NumberSchema

    /*** Private Chain Methods ***/

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

/*** Expors ***/

export default NumberSchema

export {
    NumberSchema
}