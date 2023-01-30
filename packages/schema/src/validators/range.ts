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
    isNumber,
    SignatureParser,
    isOptional,
    assign
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

interface UnarySettings {
    readonly comparator: UnaryComparator
    readonly value: number
}

interface BinarySettings {

    readonly comparator: BinaryComparator
    readonly min: number
    readonly max: number

    readonly error?: ValidationErrorInput<number>
    readonly id?: symbol
    readonly name?: string

}

//// External Types ////

const toUnarySettings = new SignatureParser({
    value: isNumber,
    comparator: isUnaryComparator,
    ...toNameErrorId.types
})
    .addLayout('value')
    .addLayout('comparator', 'value')

const toBinarySettings = new SignatureParser({
    min: isNumber,
    max: isNumber,
    comparator: isOptional(isBinaryComparator),
    ...toNameErrorId.types
})
    .setDefaults({
        comparator: '..'
    })
    .addLayout('min', 'comparator', 'max')
    .addLayout('min', 'max')

type RangeSettings = (UnarySettings | BinarySettings) & NameErrorId<number>

const toRangeSettings = SignatureParser.merge(
    toBinarySettings,
    toUnarySettings
)
 
type RangeSettingsSignature = 
    | [settings: RangeSettings]
    | [min: number, max: number] 
    | [comparator: UnaryComparator, value: number]
    | [min: number, comparator: BinaryComparator, max: number]

//// Helper ////

function isInRange(input: number, settings: RangeSettings): boolean {

    const { comparator } = settings
    switch (comparator) {
        case '>': {
            return input > settings.value
        }
        case '>=': {
            return input >= settings.value
        }
        case '==': {
            return input === settings.value
        }
        case '<': {
            return input < settings.value
        }
        case '<=': {
            return input <= settings.value
        }
        case '..': {
            return input >= settings.min && input < settings.max
        }
        case '...': {
            return input >= settings.min && input <= settings.max
        }
        default: {
            const badComparator: never = comparator
            throw new Error(`${badComparator} is an invalid option.`)
        }
    }
}

function rangeDescription(settings: RangeSettings): string {
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

interface RangeValidatorBase extends Validate<number,number>, Omit<ValidatorSettings<number,number>, 'error' | 'id'> {
    detail(): string
    isBinary(): this is BinaryRangeValidator
    isUnary(): this is UnaryRangeValidator
}

interface BinaryRangeValidator extends RangeValidatorBase, BinarySettings {}

interface UnaryRangeValidator extends RangeValidatorBase, UnarySettings {}

type RangeValidator = BinaryRangeValidator | UnaryRangeValidator

interface RangeValidatorConstructor {
    new (...params: RangeSettingsSignature): RangeValidator
}

const RangeValidator = class extends SubValidator<number> {

    constructor (...params: RangeSettingsSignature) {

        const { id, ...settings } = toRangeSettings(...params)
        super(id)
        assign(this, settings)
    }

    override error(this: RangeValidator): string {
        return `Must be ${this.detail()}`
    }

    override isValid(this: RangeValidator, input: number): boolean {
        return isInRange(input, this)
    }

    detail(this: RangeValidator): string {
        return rangeDescription(this)
    }

    isBinary(): this is BinaryRangeValidator {
        return !this.isUnary()
    }

    isUnary(): this is UnaryRangeValidator {
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