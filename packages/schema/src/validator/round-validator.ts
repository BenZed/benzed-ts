import { round, ceil, floor } from '@benzed/math'

import {
    AssertTransformEqualValidator,
    ErrorDefaultAndArgs,
    ErrorSettings
} from './validator'

/*** Types ***/

interface RoundValidatorSettings extends ErrorSettings<[
    value: number,
    method: Rounder,
    precision: number
]> {
    method: Rounder
    precision: number
}

/*** Const ***/

const ROUNDER_METHODS = { round, ceil, floor }

type Rounder = keyof typeof ROUNDER_METHODS

/*** Main ***/

class RoundValidator extends AssertTransformEqualValidator<
/**/ number,
/**/ RoundValidatorSettings
> {

    /*** AssertTransformEqualValidator Implementation ***/

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

/*** Exports ***/

export default RoundValidator

export {
    RoundValidator,
    RoundValidatorSettings
}