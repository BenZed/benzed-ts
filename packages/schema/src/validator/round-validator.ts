import { round, ceil, floor } from '@benzed/math'

import { AssertTransformEqualValidator, ErrorDefaultAndArgs, ErrorSettings } from './validator'

/*** Types ***/

interface RoundValidatorSettings<K extends Rounder> extends ErrorSettings<[
    value: number,
    method: K,
    precision: number
]> {
    method: K
    precision: number
}

/*** Const ***/

const ROUNDER_METHODS = {
    round,
    ceil,
    floor
}

type Rounder = keyof typeof ROUNDER_METHODS

/*** Main ***/

class RoundValidator<K extends Rounder> extends AssertTransformEqualValidator<
/**/ number,
/**/ RoundValidatorSettings<K>
> {

    /*** DuplexValidator Implementation ***/

    protected _transform(input: number): number {

        const { method, precision } = this.settings

        const rounder = ROUNDER_METHODS[method]

        return rounder(input, precision)
    }

    protected _getErrorDefaultAndArgs(
        input: number
    ): ErrorDefaultAndArgs<RoundValidatorSettings<K>> {

        const { method, precision } = this.settings

        return [
            `${input} must be ${method} to ${precision}`,
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