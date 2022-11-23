import { is } from '@benzed/is'
import { round } from '@benzed/math'

//// Types ////

interface DecimalOptions {
    /**
     * Number of decimal places to round to.
     * 
     * ```ts
     * digitize(2.12512, { decimalPlaces: 3 })
     * // '2.125'
     * 
     * ```
     * 
     * Output is rounded.
     * ```ts
     * digitize(2.137, { decimalPlaces: 2 })
     * // '2.14' 
     * ```
     */
    decimalPlaces: number

    /**
     * Add trailing zeros to fill the number of decimal places.
     * 
     * ```ts
     * digitize(7.1, { decimalPlaces: 2, trailingZeros: true })
     * // '7.10'
     * 
     * ``` 
     */
    trailingZeros?: boolean
}

interface WholeOptions {
    /**
     * Ensure leading zeros to the beginning of the
     * output to this number of places.
     * 
     * ```ts
     * digitize(12, { wholePlaces: 5 })
     * // '00012'
     * 
     * digitize(100, { wholePlaces: 2 })
     * // '100'
     * ```
     */
    wholePlaces: number

    /**
     * Truncate numbers that have more than the
     * given number of leading zeros.
     * 
     * ```ts
     * digitize(1234, { wholePlaces: 2, truncateWhole: true })
     * // '34'
     */
    truncateWhole?: boolean
}

type DigitizeOptions = DecimalOptions | WholeOptions | (DecimalOptions & WholeOptions)

//// Helper ////

function parseOptions(
    input?: DigitizeOptions
): Partial<DecimalOptions> & Partial<WholeOptions> {

    const hasDecimalOptions = input && 'decimalPlaces' in input
    const hasWholeOptions = input && 'wholePlaces' in input

    const output = {
        decimalPlaces: hasDecimalOptions ? input.decimalPlaces : undefined,
        trailingZeros: hasDecimalOptions ? input.trailingZeros : undefined,

        wholePlaces: hasWholeOptions ? input.wholePlaces : undefined,
        truncateWhole: hasWholeOptions ? input.truncateWhole : undefined
    }

    if (output.decimalPlaces !== undefined && !is.integer(output.decimalPlaces))
        throw new Error('options.decimalPlaces must be an integer.')

    if (output.wholePlaces !== undefined && !is.integer(output.wholePlaces))
        throw new Error('options.wholePlaces must be an integer.')

    return output
}

//// Main ////

function digitize(
    num: number | bigint,
    options?: DigitizeOptions
): `${number}` {

    // Parse Options
    const {
        decimalPlaces,
        trailingZeros,
        wholePlaces,
        truncateWhole
    } = parseOptions(options)

    // Process input
    if (!is.bigint(num) && (!isFinite(num) || is.nan(num)))
        num = 0

    if (!is.bigint(num) && decimalPlaces !== undefined) {
        const precision = 1 / 10 ** decimalPlaces
        num = round(num, precision)
    }

    const str = num.toString()
    let [whole, decimal = ''] = str.split('.')

    // Apply Whole Options
    if (wholePlaces !== undefined) {
        whole = whole
            .padStart(wholePlaces, '0')
        whole = truncateWhole
            ? whole
                .substring(whole.length - wholePlaces, whole.length)
            : whole
    }

    // Apply Decimal Options
    if (decimalPlaces !== undefined) {
        decimal = decimal
            .substring(0, decimalPlaces)

        decimal = trailingZeros
            ? decimal
                .padEnd(decimalPlaces, '0')
            : decimal
    }

    return `${whole}${decimal && '.' + decimal}` as `${number}`
}

//// Exports ////

export default digitize

export {
    digitize,
    DigitizeOptions
}