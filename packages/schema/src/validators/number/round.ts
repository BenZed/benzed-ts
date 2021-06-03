import { round, ceil, floor } from '@benzed/math'
import { isNumber } from '@benzed/is'

import { Validator } from '../type'

/*** Helper ***/

const ROUNDER_METHODS = {
    round,
    ceil,
    floor
}

/*** Types ***/

type Precision = number | boolean

interface RoundSanitizerProp {
    readonly round?: Precision
    readonly floor?: never
    readonly ceil?: never
}

interface FloorSanitizerProp {
    readonly round?: never
    readonly floor?: Precision
    readonly ceil?: never
}

interface CeilSanitizerProp {
    readonly round?: never
    readonly floor?: never
    readonly ceil?: Precision
}

type RounderSanitizerProps = RoundSanitizerProp | FloorSanitizerProp | CeilSanitizerProp

/* eslint-disable @typescript-eslint/indent */
type RoundSanitizerFactoryOutput<P> =
    P extends { round: Precision } | { ceil: Precision } | { floor: Precision }
    ? Validator<number>
    : null
/* eslint-enable @typescript-eslint/indent */

type RounderKey = keyof typeof ROUNDER_METHODS

function isRounderKey(input: string): input is RounderKey {
    return input in ROUNDER_METHODS
}

/*** Main ***/

function createRoundSanitizer<P extends RounderSanitizerProps>(
    props: P
): RoundSanitizerFactoryOutput<P> {

    const keys = Object.keys(props).filter(isRounderKey)
    if (keys.length > 1)
        throw new Error('Only one rounding algorithm may be specified.')

    if (keys.length === 0)
        return null as RoundSanitizerFactoryOutput<P>

    const [key] = keys

    const config = props[key]

    const precision = isNumber(config)
        ? config
        : 1

    const rounder = ROUNDER_METHODS[key]

    return ((number: number) =>
        rounder(number, precision)) as RoundSanitizerFactoryOutput<P>
}

/*** Exports ***/

export default createRoundSanitizer

export {
    RounderSanitizerProps
}