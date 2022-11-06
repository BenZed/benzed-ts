import {
    isInteger
} from '@benzed/is'

import {
    RangeValidator,
    RangeValidatorSettings,
    RangeValidatorSettingsShortcut,
    toRangeValidatorSettings
} from './range'

import {
    AssertValidator
} from './validator'

//// Types ////

type LengthValidatorSettings = RangeValidatorSettings<number>
type LengthValidatorSettingsShortcut = RangeValidatorSettingsShortcut<number>

//// Helper ////

const defaultLengthError = (_input: unknown, lengthTransgressionDetail: string): string =>
    `length must be ${lengthTransgressionDetail}`

//// Main ////

class LengthValidator<O extends ArrayLike<unknown>>

    extends AssertValidator<O, LengthValidatorSettings> {

    private _rangeValidator!: RangeValidator<number>

    constructor ({ error = defaultLengthError, ...settings }: LengthValidatorSettings) {
        super({
            error,
            ...settings
        })
    }

    //// AssertValidator implementation ////

    protected override _onApplySettings(): void {

        if (this._rangeValidator)
            this._rangeValidator.applySettings(this.settings)
        else
            this._rangeValidator = new RangeValidator(this.settings)

        this._validateLengthSettings()
    }

    protected _assert(input: O): void {
        this._rangeValidator.validate(input.length)
    }

    //// Helper ////

    private _validateLengthSettings(): void {

        const { settings } = this

        let validatesLengthsBelowZero: boolean
        let nonIntegerConfiguration: string | null

        if (`value` in settings) {
            validatesLengthsBelowZero = settings.value < 0
            nonIntegerConfiguration = isInteger(settings.value) ? null : `value`
        } else {
            validatesLengthsBelowZero = settings.min < 0
            nonIntegerConfiguration = isInteger(settings.min)
                ? isInteger(settings.max)
                    ? null
                    : `max`
                : `min`
        }

        if (validatesLengthsBelowZero)
            throw new Error(`cannot validate length below 0`)

        if (nonIntegerConfiguration)
            throw new Error(`${nonIntegerConfiguration} must be an integer.`)
    }
}

//// Exports ////

export default LengthValidator

export {
    LengthValidator,
    LengthValidatorSettings,
    LengthValidatorSettingsShortcut,
    toRangeValidatorSettings as toLengthValidatorSettings,

}