import { isFunction } from '@benzed/is'
import { round, ceil, floor } from '@benzed/math'

import { DuplexValidator } from './validator'

/*** Types ***/

interface RoundValidatorSettings<K extends Rounder> {
    method: K
    precision: number
    readonly error?: string | ((value: unknown, name: string) => string)
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

            const { error, method, precision } = this.settings

            throw new Error(isFunction(error)
                ? error(input, method)
                : error ?? `must be ${method}ed to ${precision}`
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