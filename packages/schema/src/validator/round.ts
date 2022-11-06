import {
    isNumber
} from '@benzed/is'

import {
    round,
    ceil,
    floor
} from '@benzed/math'

import {
    AssertValidTransformValidator,
    ErrorDefaultAndArgs,
    ErrorSettings,
    ErrorDefault
} from './validator'

//// Types ////

interface RoundValidatorSettings extends ErrorSettings<[
    value: number,
    method: RounderMethod,
    precision: number
]> {
    method: RounderMethod
    precision: number
}

type RounderMethod = keyof typeof ROUNDER_METHODS

type RoundValidatorSettingsShortcut = [
    precision: number,
    error: ErrorDefault<RoundValidatorSettings>
] | [
    precision: number
] | [
    Omit<RoundValidatorSettings, 'method'>
]

//// Const ////

const ROUNDER_METHODS = { round, ceil, floor }

//// Helper ////

function toRoundValidatorSettings(
    method: RounderMethod,
    shortcut: RoundValidatorSettingsShortcut,
): RoundValidatorSettings {

    const { precision, error } = isNumber(shortcut[0])
        ? { precision: shortcut[0], error: shortcut[1] }
        : shortcut[0]

    return {
        precision,
        method,
        error
    }

}

//// Main ////

class RoundValidator extends AssertValidTransformValidator<
/**/ number,
/**/ RoundValidatorSettings
> {

    //// AssertTransformEqualValidator Implementation ////

    protected _transform(input: number): number {

        const { method, precision } = this.settings

        const rounder = ROUNDER_METHODS[method]

        return rounder(input, precision)
    }

    protected _getErrorDefaultAndArgs(
        input: number
    ): ErrorDefaultAndArgs<RoundValidatorSettings> {

        const { method, precision } = this.settings

        return [
            `${input} must be ${method}ed to ${precision}`,
            input,
            method,
            precision
        ]
    }

}

//// Exports ////

export default RoundValidator

export {
    RoundValidator,
    RoundValidatorSettings,
    RoundValidatorSettingsShortcut,
    toRoundValidatorSettings,

    RounderMethod
}