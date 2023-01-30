import {

    Validator,
    ValidationErrorInput,
    isValidationErrorInput,
    Validate,
    ValidatorSettings

} from '@benzed/schema'

import {
    isNumber,
    SignatureParser,
    isOptional,
} from '@benzed/util'

//// Internal Types ////

const BINARY_COMPARATORS = ['..', '...'] as const
type BinaryComparator = typeof BINARY_COMPARATORS[number]
const isBinaryComparator = (i: unknown): i is BinaryComparator => BINARY_COMPARATORS.includes(i as BinaryComparator)

const UNARY_COMPARATORS = ['>=', '>', '==', '<', '<='] as const
type UnaryComparator = typeof UNARY_COMPARATORS[number]
const isUnaryComparator = (i: unknown): i is UnaryComparator => UNARY_COMPARATORS.includes(i as UnaryComparator)
interface UnarySettings {
    readonly comparator: UnaryComparator
    readonly value: number
    readonly error?: ValidationErrorInput<number>
}

interface BinarySettings {
    readonly comparator: BinaryComparator
    readonly min: number
    readonly max: number
    readonly error?: ValidationErrorInput<number>
}

//// External Types ////

const toUnarySettings = new SignatureParser({
    value: isNumber,
    comparator: isOptional(isUnaryComparator),
    error: isOptional(isValidationErrorInput<number>)
})
    .setDefaults({
        comparator: '=='
    })
    .addLayout('value')
    .addLayout('comparator', 'value')

const toBinarySettings = new SignatureParser({
    min: isNumber,
    max: isNumber,
    comparator: isOptional(isBinaryComparator),
    error: isOptional(isValidationErrorInput<number>),
})
    .setDefaults({
        comparator: '..'
    })
    .addLayout('min', 'comparator', 'max')
    .addLayout('min', 'max')

type RangeSettings = UnarySettings | BinarySettings

const toRangeSettings = SignatureParser.merge(
    toUnarySettings,
    toBinarySettings
)
 
type RangeSettingsSignature = 
    | [equals: number] 
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

type RangeValidator = 
    & Validate<number,number> 
    & Omit<ValidatorSettings<number,number>, 'error'> 
    & RangeSettings  
    & { detail(): string }

interface RangeValidatorConstructor {
    new (...params: RangeSettingsSignature): RangeValidator
}

const RangeValidator = class extends Validator<number, number> {

    constructor (...params: RangeSettingsSignature) {
        super({
            ...toRangeSettings(...params),
            isValid(this: RangeValidator, input) {
                return isInRange(input, this)
            },
        })
    }

    override error(this: RangeValidator): string {
        return `Must be ${this.detail()}`
    }

    detail(this: RangeValidator): string {
        return rangeDescription(this)
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