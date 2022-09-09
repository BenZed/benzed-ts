import { pluck } from '@benzed/array'
import { isFunction, isNumber, isObject, isString, Sortable } from '@benzed/is'

import { AssertValidator } from './validator'

/*** Types ***/

const BETWEEN_COMPARATORS = ['-', '..', '...'] as const
const RANGE_COMPARATORS = ['>=', '>', '==', '<', '<='] as const

const RANGE_STRING_REGEX = new RegExp(
    '(\\d*\\.?\\d+)' + // 0 | 0.0 | .0
    '(<|<=|==|>=|>|\\.{2,3}|-)' + // >= | > | == | < | <= | .. | ... | -
    '(\\d*\\.?\\d+)' // 0 | 0.0 | .0
)

/*** Errors ***/

type RangeValidationErrorFormat =
    string | ((input: Sortable, rangeTransgressionDetail: string) => string)

/*** Types ***/

type BetweenComparator = typeof BETWEEN_COMPARATORS[number]
type RangeComparator = typeof RANGE_COMPARATORS[number]

type RangeValidatorSettings = {
    readonly min: number
    readonly max: number
    readonly comparator?: BetweenComparator
    readonly error?: RangeValidationErrorFormat
} | {
    readonly value: number
    readonly comparator: RangeComparator
    readonly error?: RangeValidationErrorFormat
}

type RangeValidatorSettingsArrayShortcut =
    [min: number, max: number] |
    [min: number, max: number, error: RangeValidationErrorFormat] |
    [min: number, comparator: BetweenComparator, max: number] |
    [min: number, comparator: BetweenComparator, max: number, error: RangeValidationErrorFormat] |
    [comparator: RangeComparator, value: number] |
    [comparator: RangeComparator, value: number, error: RangeValidationErrorFormat] |
    [value: number]

type RangeValidatorSettingsStringShortcut =
    `${number}${BetweenComparator}${number}` |
    `${RangeComparator}${number}`

type RangeValidatorSettingsShortcut =
    RangeValidatorSettingsArrayShortcut |
    [RangeValidatorSettingsStringShortcut] |
    [RangeValidatorSettings]

/*** Type Guards ***/

function isBetweenComparator(input: unknown): input is BetweenComparator {
    return BETWEEN_COMPARATORS.includes(input as BetweenComparator)
}

function isRangeComparator(input: unknown): input is RangeComparator {
    return RANGE_COMPARATORS.includes(input as RangeComparator)
}

function isRangeValidatorSettings(input: unknown): input is RangeValidatorSettings {

    if (!isObject(input))
        return false

    const option = input as RangeValidatorSettings
    if ('value' in option) {
        return typeof option.value === 'number' &&
            isRangeComparator(option.comparator)
    }

    if ('min' in option) {
        return typeof option.min === 'number' &&
            typeof option.max === 'number'
    }

    return false
}

/*** Helper ***/

function parseRangeValidatorStringShortcut(
    range: RangeValidatorSettingsStringShortcut
): RangeValidatorSettings {

    const match = range.match(RANGE_STRING_REGEX)

    let min = NaN
    let comparator = ''
    let max = NaN

    if (match) {
        min = parseFloat(match[1])
        comparator = match[2]
        max = parseFloat(match[3])
    }

    if (
        !Number.isNaN(min) &&
        BETWEEN_COMPARATORS.includes(comparator as BetweenComparator) &&
        !Number.isNaN(max)
    ) {
        return {
            min,
            max,
            comparator: comparator as BetweenComparator
        }
    }

    if (
        RANGE_COMPARATORS.includes(comparator as RangeComparator) &&
        !Number.isNaN(max)
    ) {
        return {
            value: max,
            comparator: comparator as RangeComparator
        }
    }

    throw new Error(`"${range}" is not a valid range string.`)
}

function parseRangeValidatorSettingsArrayShortcut(
    range: RangeValidatorSettingsArrayShortcut
): RangeValidatorSettings {

    range = [...range] // don't mutate input array

    const numbers = pluck(range, isNumber) as number[]
    if (numbers.length === 2) {
        const [min, max] = numbers
        const [comparator] = pluck(range, isBetweenComparator) as BetweenComparator[]
        const [error] = range as string[] // only thing left could be error

        return { min, max, comparator, error }

    } else {
        const [value] = numbers
        const [comparator = '=='] = pluck(range, isRangeComparator) as RangeComparator[]
        const [error] = range as string[] // only thing left could be error

        return { value, comparator, error }
    }
}

function toRangeValidatorSettings(
    input: RangeValidatorSettingsShortcut
): RangeValidatorSettings {

    let settings: RangeValidatorSettings

    if (input.length === 1) {

        if (isString(input[0]))
            settings = parseRangeValidatorStringShortcut(input[0])

        else if (isNumber(input[0])) {
            settings = {
                value: input[0],
                comparator: '=='
            }
        } else
            settings = input[0]
    } else
        settings = parseRangeValidatorSettingsArrayShortcut(input)

    if (!isRangeValidatorSettings(settings))
        throw new Error('Invalid Range Settings Input')

    return settings
}

/*** Main ***/

class RangeValidator<O extends Sortable> extends AssertValidator<
/**/ O,
/**/ O,
/**/ RangeValidatorSettings
> {

    private _rangeTest: (input: O) => string | null

    public constructor (settings: RangeValidatorSettings) {
        super(settings)
        this._rangeTest = this._createRangeTest()
    }

    /*** AssertValidator Implementation ***/

    public override applySettings(settings: Partial<RangeValidatorSettings>): this {
        super.applySettings(settings)
        this._rangeTest = this._createRangeTest()
        return this
    }

    public assert(input: O): void {

        const rangeTransgressionDetail = this._rangeTest(input)
        if (rangeTransgressionDetail === null)
            return

        const { error: errorFormat } = this.settings

        const errorMessage = isFunction(errorFormat)
            ? errorFormat(input, rangeTransgressionDetail)
            : errorFormat ?? `${input} must be ${rangeTransgressionDetail}`

        throw new Error(errorMessage)
    }

    /*** Helpers ***/

    private _createRangeTest(): (input: O) => string | null {

        const { settings } = this

        const PASS = null

        switch (settings.comparator) {

            case '<': {
                const { value } = settings
                return input => input < value
                    ? PASS
                    : `below ${value}`
            }

            case '<=': {
                const { value } = settings
                return input => input <= value
                    ? PASS
                    : `equal or below ${value}`
            }

            case '==': {
                const { value } = settings
                return input => input === value
                    ? PASS
                    : `equal ${value}`
            }

            case '>': {
                const { value } = settings
                return input => input > value
                    ? PASS
                    : `above ${value}`
            }

            case '>=':
                const { value } = settings
                return input => input >= value
                    ? PASS
                    : `above or equal ${value}`

            case '...': {
                const { min, max } = settings
                return input => input >= min && input <= max
                    ? PASS
                    : `from ${min} to ${max}`
            }

            default: { // .. | - | undefined
                const { min, max } = settings
                return input => input >= min && input < max
                    ? PASS
                    : `from ${min} to less than ${max}`
            }
        }
    }
}

/*** Exports ***/

export default RangeValidator

export {
    RangeValidator,
    RangeValidatorSettings,
    RangeValidatorSettingsShortcut,

    toRangeValidatorSettings
}