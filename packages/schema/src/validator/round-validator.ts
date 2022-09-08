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

    public transform(input: number): number {
        return this._getRounded(input)
    }

    public assert(input: number): void {

        if (input !== this._getRounded(input)) {

            const { error, method, precision } = this.settings

            throw new Error(isFunction(error)
                ? error(input, method)
                : error ?? `must be ${method}ed to ${precision}`
            )
        }
    }

    private _getRounded(input: number): number {
        const { method, precision } = this.settings
        return ROUNDER_METHODS[method](input, precision)
    }

}

/*** Exports ***/

export default RoundValidator

export {
    RoundValidator,
    RoundValidatorSettings
}