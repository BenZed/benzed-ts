import type {
    Validate,
    ValidationErrorInput,
    ValidatorSettings,
} from '../validator'

import {
    SubValidator,
    toNameErrorId,
    NameErrorId
} from '../validator/abstract'

import {
    SignatureParser,
    isOptional,
    assign,
    Sortable,
    isSortable,
    toComparable
} from '@benzed/util'

//// Internal Types ////

const BINARY_COMPARATORS = ['..', '...'] as const
type BinaryComparator = typeof BINARY_COMPARATORS[number]
const isBinaryComparator = (i: unknown): i is BinaryComparator =>
    BINARY_COMPARATORS.includes(i as BinaryComparator)

const UNARY_COMPARATORS = ['>=', '>', '==', '<', '<='] as const
type UnaryComparator = typeof UNARY_COMPARATORS[number]
const isUnaryComparator = (i: unknown): i is UnaryComparator => 
    UNARY_COMPARATORS.includes(i as UnaryComparator)

interface UnarySettings<T extends Sortable> {
    readonly comparator: UnaryComparator
    readonly value: T
}

interface BinarySettings<T extends Sortable> {

    readonly comparator: BinaryComparator
    readonly min: T
    readonly max: T

    readonly error?: ValidationErrorInput<T>
    readonly id?: symbol
    readonly name?: string

}

//// Settings Types ////

type RangeSettings<T extends Sortable> = (UnarySettings<T> | BinarySettings<T>) & NameErrorId<T>
 
type RangeSettingsSignature<T extends Sortable> = 
    | [settings: RangeSettings<T>]
    | [min: T, max: T] 
    | [comparator: UnaryComparator, value: T]
    | [min: T, comparator: BinaryComparator, max: T]

const isComparable = (input: unknown): input is Sortable =>
    isSortable(input) && 
    !isUnaryComparator(input) && 
    !isBinaryComparator(input)

const toUnarySettings = new SignatureParser({
    value: isComparable,
    comparator: isUnaryComparator,
    ...toNameErrorId.types
})
    .addLayout('value')
    .addLayout('comparator', 'value')

const toBinarySettings = new SignatureParser({
    min: isComparable,
    max: isComparable,
    comparator: isOptional(isBinaryComparator),
    ...toNameErrorId.types
})
    .setDefaults({
        comparator: '..'
    })
    .addLayout('min', 'comparator', 'max')
    .addLayout('min', 'max')

const toRangeSettings = SignatureParser.merge(
    toBinarySettings,
    toUnarySettings
)

//// Helper ////

function isInRange<T extends Sortable>(
    input: T, 
    settings: RangeSettings<T>
): boolean {

    const { comparator } = settings
    switch (comparator) {
        case '>': {
            return toComparable(input) > toComparable(settings.value)
        }
        case '>=': {
            return toComparable(input) >= toComparable(settings.value)
        }
        case '==': {
            return toComparable(input) === toComparable(settings.value)
        }
        case '<': {
            return toComparable(input) < toComparable(settings.value)
        }
        case '<=': {
            return toComparable(input) <= toComparable(settings.value)
        }
        case '..': {
            const s = toComparable(input)
            return (
                s >= toComparable(settings.min) && 
                s < toComparable(settings.max)
            )
        }
        case '...': {
            const s = toComparable(input)
            return (
                s >= toComparable(settings.min) && 
                s <= toComparable(settings.max)
            )
        }
        default: {
            const badComparator: never = comparator
            throw new Error(`${badComparator} is an invalid option.`)
        }
    }
}

function rangeDescription<T extends Sortable>(settings: RangeSettings<T>): string {
    const { comparator } = settings
    switch (comparator) {
        case '>': {
            return `above ${settings.value}`
        }
        case '>=': {
            return `equal or above ${settings.value}`
        }
        case '==': {
            return `equal ${settings.value}`
        }
        case '<': {
            return `below ${settings.value}`
        }
        case '<=': {
            return `equal or below ${settings.value}`
        }
        case '..': {
            return `equal or above ${settings.min} and below ${settings.max}`
        }
        case '...': {
            return `equal or above ${settings.min} and below or equal ${settings.max}`
        }
        default: {
            const badComparator: never = comparator
            throw new Error(`${badComparator} is an invalid option.`)
        }
    }
}

//// Exports ////

interface RangeValidatorBase<T extends Sortable> extends Validate<T>, Omit<ValidatorSettings<T>, 'error' | 'id'> {
    detail(): string
    isBinary(): this is BinaryRangeValidator<T>
    isUnary(): this is UnaryRangeValidator<T>
}

interface BinaryRangeValidator<T extends Sortable> extends RangeValidatorBase<T>, BinarySettings<T> {}

interface UnaryRangeValidator<T extends Sortable> extends RangeValidatorBase<T>, UnarySettings<T> {}

type RangeValidator<T extends Sortable> = BinaryRangeValidator<T> | UnaryRangeValidator<T>

interface RangeValidatorConstructor {
    new <T extends Sortable>(...params: RangeSettingsSignature<T>): RangeValidator<T>
}

const RangeValidator = class extends SubValidator<Sortable> {

    constructor (...params: RangeSettingsSignature<Sortable>) {

        const { id, ...settings } = toRangeSettings(...params)
        super(id)
        assign(this, settings)
    }

    override error(this: RangeValidator<Sortable>): string {
        return `Must be ${this.detail()}`
    }

    override isValid(this: RangeValidator<Sortable>, input: number): boolean {
        return isInRange(input, this)
    }

    detail(this: RangeValidator<Sortable>): string {
        return rangeDescription(this)
    }

    isBinary(): this is BinaryRangeValidator<Sortable> {
        return !this.isUnary()
    }

    isUnary(): this is UnaryRangeValidator<Sortable> {
        return 'value' in this
    }

} as unknown as RangeValidatorConstructor

//// Exports ////

export default RangeValidator 

export {
    RangeValidator,
    RangeValidatorConstructor,

    toRangeSettings,
    RangeSettings, 
    RangeSettingsSignature,

    isInRange,
    rangeDescription

}