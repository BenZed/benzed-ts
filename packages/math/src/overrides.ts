/*** Shortcuts ***/

const {
    abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil: _ceil, clz32,
    cos, cosh, exp, expm1, floor: _floor, fround, hypot, imul, log, log10, log1p, log2,
    pow, random: _random, round: _round, sign, sin, sinh, sqrt, tan, tanh, trunc,
    min, max
} = Math

/*** Constants ***/

const SIN_PSUEDO_RANDOM_MULTIPLIER = 1000000000

/*** Overridden ***/

/**
 * Get a random number within the given range.
 * Optionally a seed can be provided.
 *
 * @param {number} [min=0] Description
 * @param {type}   max     Description
 * @param {type}   various Description
 *
 * @return {type} Description
 */
export function random(min = 0, max = 1, seed?: number): number {

    let value

    // handle seed
    if (typeof seed === 'number') {
        value = sin(seed) * SIN_PSUEDO_RANDOM_MULTIPLIER
        value -= _floor(value)

    } else
        value = _random()

    value *= max - min
    value += min

    return value
}

/**
 * Round to a given precision.
 *
 * @param value - Value to round.
 * @param precision - Precision to round by.
 */
export function round(value: number, precision = 1): number {

    return precision === 0
        ? value
        : _round(value / precision) * precision
}

/**
 * Floor a given value to a given precision.
 *
 * @param value - Value to round.
 * @param precision - Precision to round by.
 */
export function floor(value: number, precision = 1): number {

    // required to ensure negative place values yield the same
    // results as positive ones
    precision = abs(precision)

    return precision === 0 ? value : _floor(value / precision) * precision
}

/**
 * Ceils a given value to a given precision.
 *
 * @param value - Value to round.
 * @param precision - Precision to round by.
 */
export function ceil(value: number, precision = 1): number {

    // required to ensure negative place values yield the same
    // results as positive ones
    precision = abs(precision)

    return precision === 0 ? value : _ceil(value / precision) * precision

}

/*** Re Exports ***/

export {
    abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, clz32, cos,
    cosh, exp, expm1, fround, log, log10, log1p, log2, pow, sign, sin, sinh,
    sqrt, tan, tanh, trunc, hypot, imul, min, max
}