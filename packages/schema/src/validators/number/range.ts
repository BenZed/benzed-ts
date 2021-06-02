import { pluck } from '@benzed/array'
import { isArray, isNumber, isObject, isString } from '@benzed/is'

import { Validator } from '../type'

import resolveErrorMessager, { ErrorMessager } from '../../util/resolve-error-messager'

/*** Constants ***/

const BETWEEN_COMPARATORS = ['-', '..', '...'] as const
const RANGE_COMPARATORS = ['>=', '>', '==', '<', '<='] as const

const RANGE_STRING_REGEX = new RegExp(
    '(\\d*\\.?\\d*)' + // 0 | 0.0 | .0
    '(<|<=|==|>=|>|\\.{2,3}|-)' + // >= | > | == | < | <= | .. | ... | -
    '(\\d*\\.?\\d*)' // 0 | 0.0 | .0
)

/*** Types ***/

type RangeErrorMessager = ErrorMessager<number>

type BetweenComparator = typeof BETWEEN_COMPARATORS[number]
type RangeComparator = typeof RANGE_COMPARATORS[number]

type RangeConfig = {
    min: number
    max: number
    comparator?: BetweenComparator
    error?: string | RangeErrorMessager
} | {
    value: number
    comparator: RangeComparator
    error?: string | RangeErrorMessager
}

type RangeArrayConfig =
    [min: number, max: number] |
    [min: number, max: number, error: string | RangeErrorMessager] |
    [min: number, comparator: BetweenComparator, max: number] |
    [min: number, comparator: BetweenComparator, max: number, error: string | RangeErrorMessager] |
    [value: number] |
    [comparator: RangeComparator, value: number] |
    [comparator: RangeComparator, value: number, error: string | RangeErrorMessager]

type RangeStringConfig =
    `${number}${BetweenComparator}${number}` |
    `${RangeComparator}${number}`

interface RangeValidatorProps {
    range?: RangeArrayConfig | RangeStringConfig | RangeConfig | number
}

/*** Type Guards ***/

function isBetweenComparator(input: unknown): input is BetweenComparator {
    return BETWEEN_COMPARATORS.includes(input as BetweenComparator)
}

function isRangeComparator(input: unknown): input is RangeComparator {
    return RANGE_COMPARATORS.includes(input as RangeComparator)
}

function isRangeOption(input: unknown): input is RangeConfig {

    if (!isObject(input))
        return false

    const option = input as RangeConfig
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

function parseRangeStringOption(
    range: RangeStringConfig
): RangeConfig {

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

function parseRangeArrayOption(
    range: RangeArrayConfig
): RangeConfig {

    range = [...range] // don't mutate input array

    const numbers = pluck(range, item => typeof item === 'number') as number[]
    if (numbers.length === 2) {
        const [min, max] = numbers
        const [comparator] = pluck(range, isBetweenComparator) as BetweenComparator[]
        const [error] = range as string[] // only thing left could be error

        return { min, max, comparator, error }
    } else {
        const [value] = numbers
        const [comparator = '=='] = pluck(range, isRangeComparator) as RangeComparator[]
        const [error] = range as string[] // only thing left could be error

        return {
            value, comparator, error
        }
    }
}

function toRangeConfig(
    rangeProp: NonNullable<RangeValidatorProps['range']>
): RangeConfig {

    let options: RangeConfig

    if (isString(rangeProp))
        options = parseRangeStringOption(rangeProp)

    else if (isArray(rangeProp))
        options = parseRangeArrayOption(rangeProp)

    else if (isNumber(rangeProp)) {
        options = {
            value: rangeProp,
            comparator: '=='
        }
    } else
        options = rangeProp

    if (!isRangeOption(options))
        throw new Error('Invalid range options object.')

    return options
}

/*** Main ***/

function createRangeValidator(
    props: Readonly<RangeValidatorProps>
): Validator<number> | null {

    if (!props.range)
        return null

    const options = toRangeConfig(props.range)

    let test: (input: number) => boolean
    let failDetail: string

    switch (options.comparator) {

        case '<': {
            const { value } = options

            test = input => input < value
            failDetail = `below ${value}`

            break
        }

        case '<=': {
            const { value } = options

            test = input => input <= value
            failDetail = `equal or below ${value}`

            break
        }

        case '==': {
            const { value } = options

            test = input => input === value
            failDetail = `equal ${value}`

            break
        }

        case '>': {
            const { value } = options

            test = input => input > value
            failDetail = `above ${value}`

            break
        }

        case '>=':
            const { value } = options

            test = input => input >= value
            failDetail = `above or equal ${value}`

            break

        case '...': {
            const { min, max } = options

            test = input => input >= min && input <= max
            failDetail = `between ${min} and ${max}`

            break
        }

        default: { // .. | - | undefined
            const { min, max } = options

            test = input => input >= min && input < max
            failDetail = `at least ${min} to at most ${max}`

            break
        }
    }

    const failMessager: RangeErrorMessager = resolveErrorMessager(options.error)

    return (input: number) => {
        if (!test(input))
            throw new Error(failMessager(input, failDetail))

        return input
    }
}

/*** Exports ***/

export default createRangeValidator

export {
    createRangeValidator,
    toRangeConfig,
    RangeConfig,

    RangeValidatorProps,

    RangeComparator,
    BetweenComparator
}