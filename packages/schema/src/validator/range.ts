import { pluck } from '@benzed/array'

import { AssertValidator, ErrorSettings } from './validator'

//// Types ////

const BINARY_COMPARATORS = ['-', '..', '...'] as const
const UNARY_COMPARATORS = ['>=', '>', '==', '<', '<='] as const

//// Types ////

type BinaryComparator = typeof BINARY_COMPARATORS[number]
type UnaryComparator = typeof UNARY_COMPARATORS[number]

type RangeValidatorSettings<O extends Sortable> =
    ErrorSettings<[input: O, rangeTransgressionDetail: string]> &
    ({
        readonly min: O
        readonly max: O
        readonly comparator?: BinaryComparator
    } | {
        readonly value: O
        readonly comparator: UnaryComparator
    })

type RangeValidatorErrorFormat<O extends Sortable> = NonNullable<RangeValidatorSettings<O>['error']>

type RangeValidatorSettingsArrayShortcut<O extends Sortable> =
    [min: O, max: O] |
    [min: O, max: O, error: RangeValidatorErrorFormat<O>] |
    [min: O, comparator: BinaryComparator, max: O] |
    [min: O, comparator: BinaryComparator, max: O, error: RangeValidatorErrorFormat<O>] |
    [comparator: UnaryComparator, value: O] |
    [comparator: UnaryComparator, value: O, error: RangeValidatorErrorFormat<O>] |
    [value: O]

type RangeValidatorSettingsShortcut<O extends Sortable> =
    RangeValidatorSettingsArrayShortcut<O> |
    [RangeValidatorSettings<O>]

//// Type Guards ////

const isNumericSortable = (input: unknown): input is Sortable => 
    !is.string(input) && is.sortable(input)
    
function isBinaryComparator(input: unknown): input is BinaryComparator {
    return BINARY_COMPARATORS.includes(input as BinaryComparator)
}

function isUnaryComparator(input: unknown): input is UnaryComparator {
    return UNARY_COMPARATORS.includes(input as UnaryComparator)
}

function isRangeValidatorSettings<O extends Sortable>(
    input: unknown
): input is RangeValidatorSettings<O> {

    if (!is.object(input))
        return false

    const option = input as RangeValidatorSettings<O>
    if ('value' in option) {
        return typeof option.value === 'number' &&
            isUnaryComparator(option.comparator)
    }

    if ('min' in option) {
        return (
            typeof option.min === 'number' &&
            typeof option.max === 'number'
        )
    }

    return false
}

//// Helper ////

function parseRangeValidatorSettingsArrayShortcut<O extends Sortable>(
    range: RangeValidatorSettingsArrayShortcut<O>
): RangeValidatorSettings<O> {

    range = [...range] // don't mutate input array

    const numbers = pluck(range, isNumericSortable) as O[]
    if (numbers.length === 2) {
        const [min, max] = numbers
        const [comparator] = pluck(range, isBinaryComparator) as BinaryComparator[]
        const [error] = range as RangeValidatorErrorFormat<O>[] // only thing left could be error

        return { min, max, comparator, error }

    } else {
        const [value] = numbers
        const [comparator = '=='] = pluck(range, isUnaryComparator) as UnaryComparator[]
        const [error] = range as RangeValidatorErrorFormat<O>[] // only thing left could be error

        return { value, comparator, error }
    }
}

function toRangeValidatorSettings<O extends Sortable>(
    input: RangeValidatorSettingsShortcut<O>
): RangeValidatorSettings<O> {

    let settings: RangeValidatorSettings<O>

    if (input.length === 1) {

        if (isNumericSortable(input[0])) {
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

//// Main ////

class RangeValidator<O extends Sortable = number> extends AssertValidator<
/**/ O,
/**/ RangeValidatorSettings<O>
> {

    //// AssertValidator Implementation ////

    protected override _onApplySettings(): void {
        this._rangeTest = this._createRangeTest()
    }

    protected _assert(input: O): void {

        const rangeTransgressionDetail = this._rangeTest(input)
        if (rangeTransgressionDetail === null)
            return

        this._throwWithErrorSetting(
            `${input} must be ${rangeTransgressionDetail}`,
            input,
            rangeTransgressionDetail
        )
    }

    //// Helpers ////

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

            default: {
                const { min, max } = settings
                return input => input >= min && input < max
                    ? PASS
                    : `from ${min} to less than ${max}`
            }
        }
    }
}

interface RangeValidator<O extends Sortable = number> {
    /**
     * @internal
     */
    _rangeTest: (input: O) => string | null

}

//// Exports ////

export default RangeValidator

export {
    RangeValidator,
    RangeValidatorSettings,
    RangeValidatorSettingsShortcut,

    toRangeValidatorSettings
}