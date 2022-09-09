import { round, ceil, floor } from '@benzed/math'

import { DuplexValidator, ErrorSettings } from './validator'

/*** Types ***/

interface RoundValidatorSettings<K extends Rounder>
    extends ErrorSettings<[value: unknown, method: string, precision: number]> {
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

class RoundValidator<K extends Rounder> extends DuplexValidator<
/**/ number,
/**/ number,
/**/ RoundValidatorSettings<K>
> {

    /*** DuplexValidator Implementation ***/

    public transform(input: number): number {

        const { method, precision } = this.settings

        const rounder = ROUNDER_METHODS[method]

        return rounder(input, precision)
    }

    public assert(input: number): void {
        if (input !== this.transform(input)) {

            const { method, precision } = this.settings

            this._throwWithErrorSetting(
                `${input} must be ${method} to ${precision}`,
                input,
                method,
                precision
            )
        }
    }

}

/*** Exports ***/

export default RoundValidator

export {
    RoundValidator,
    RoundValidatorSettings
}