import { isInteger, isNumber } from '@benzed/is/lib'
import RangeValidator, {
    RangeValidatorSettings,
    RangeValidatorSettingsShortcut,
    toRangeValidatorSettings
} from './range-validator'

import { AssertTransformEqualValidator } from './validator'

/*** Types ***/

type LengthValidatorSettings = RangeValidatorSettings

/*** Main ***/

class LengthValidator<O extends ArrayLike<unknown>>

    extends AssertTransformEqualValidator<O, O, LengthValidatorSettings> {

    private readonly _rangeValidator: RangeValidator<number>

    public constructor (settings: LengthValidatorSettings) {
        super({
            error: (_input, lengthTransgressionDetail) =>
                `length must be ${lengthTransgressionDetail}`,
            ...settings
        })

        this._rangeValidator = new RangeValidator(this.settings)
        this._validateLengthSettings()
    }

    public override applySettings(settings: LengthValidatorSettings): void {

        super.applySettings(settings)

        this._rangeValidator.applySettings(this.settings)
        this._validateLengthSettings()

    }

    public assert(input: O): void {
        this._rangeValidator.assert(input.length)
    }

    /*** Helper ***/

    private _validateLengthSettings(): void {

        const lengthBelowZeroIsValid = this._rangeValidator['_rangeTest'](-1) === null
        if (lengthBelowZeroIsValid)
            throw new Error('cannot validate length below 0')

        Object.entries(this.settings).forEach(([key, value]) => {
            if (isNumber(value) && !isInteger(value))
                throw new Error(`${key} must be an integer.`)
        })

    }

}

/*** Exports ***/

export default LengthValidator

export {
    LengthValidator,
    LengthValidatorSettings,
    RangeValidatorSettingsShortcut as LengthValidatorSettingsShortcut,
    toRangeValidatorSettings as toLengthValidatorSettings,

}