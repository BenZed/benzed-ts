import { pow, floor } from './overrides'

/*** Types ***/

type Fraction = readonly [numerator: number, denominator: number]

/*** Helper ***/

function getNumberOfDecimalPlaces(value: number): number {
    return floor(value) === value
        ? 0
        : value
            .toString()
            .split('.')[1]
            .length
}

function getGreatestCommonDivisor(numerator: number, denominator: number): number {

    return denominator > Number.EPSILON
        ? getGreatestCommonDivisor(denominator, numerator % denominator)
        : numerator

}

/*** Main ***/

/**
 * Converts the given number to a fractional representation.
 * @param value 
 * @returns Fraction
 */
function toFraction(value: number): Fraction {

    if (Number.isNaN(value))
        throw new Error('cannot convert NaN to a fraction')

    const denominator = pow(10, getNumberOfDecimalPlaces(value))
    const numerator = value * denominator

    const divisor = getGreatestCommonDivisor(numerator, denominator)

    return [
        numerator / divisor,
        denominator / divisor
    ]
}

function fromFraction(fraction: Fraction): number {
    const [numerator, denominator] = fraction
    return numerator / denominator
}

/*** Exports ***/

export default toFraction

export {
    toFraction,
    fromFraction,
    Fraction
}