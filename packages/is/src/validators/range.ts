import { nil, Sortable } from '@benzed/util'
import { assert } from 'console'
import { validator, Validator } from '../validator'

////  ////

const BINARY_COMPARATORS = ['-', '..', '...'] as const
const UNARY_COMPARATORS = ['>=', '>', '==', '<', '<='] as const

//// Types ////

interface RangeValidator<T extends Sortable> extends Validator<T, T> {
    
}

//// Types ////

type BinaryComparator = typeof BINARY_COMPARATORS[number]
type UnaryComparator = typeof UNARY_COMPARATORS[number]

type RangeSettings<T extends Sortable> = {
    readonly min: T
    readonly max: T
    readonly comparator?: BinaryComparator
} | {
    readonly value: T
    readonly comparator: UnaryComparator
}
 
////  ////

function createRangeTest<T extends Sortable>(
    settings: RangeSettings<T>
): (input: T) => string | nil {

    const PASS = nil

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

//// Exports ////

export function range<T extends Sortable>(min: T, comparator: BinaryComparator, max: T): RangeValidator<T>
export function range<T extends Sortable>(min: T, max: T): RangeValidator<T>
export function range<T extends Sortable>(comparator: UnaryComparator, value: T): RangeValidator<T>
export function range<T extends Sortable>(settings: RangeSettings<T>): RangeValidator<T>

export function range<T extends Sortable>(
    ...args: [RangeSettings<T>]  | [T, UnaryComparator] | [T, BinaryComparator, T] | [T, T]
): RangeValidator<T>

 
}