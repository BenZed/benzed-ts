import { Callable, isFunc, isObject, nil } from '@benzed/util'

import { Validate, ValidateContext, ValidateOptions, ValidationError } from '../validator'

//// Internal Types ////

const BINARY_COMPARATORS = ['..', '...'] as const
type BinaryComparator = typeof BINARY_COMPARATORS[number]
const isBinaryComparator = (i: unknown): i is BinaryComparator => BINARY_COMPARATORS.includes(i as BinaryComparator)

const UNARY_COMPARATORS = ['>=', '>', '==', '<', '<='] as const
type UnaryComparator = typeof UNARY_COMPARATORS[number]
const isUnaryComparator = (i: unknown): i is UnaryComparator => UNARY_COMPARATORS.includes(i as UnaryComparator)

type RangeErrorMessage = (value: number, detail: string, ctx: ValidateContext<number>) => string

interface UnarySettings {
    readonly comparator: UnaryComparator
    readonly value: number

    readonly error?: string | RangeErrorMessage
}

interface BinarySettings {
    readonly comparator: BinaryComparator
    readonly min: number
    readonly max: number

    readonly error?: string | RangeErrorMessage
}

//// External Types ////

type RangeSettings = UnarySettings | BinarySettings
function toRangeSettings(signature: RangeSettingsSignature): RangeSettings {
    const [ a1, a2, a3 ] = signature

    if (a1 instanceof RangeValidator)
        return a1.settings

    if (isObject<RangeSettings>(a1))
        return a1
    
    if (isUnaryComparator(a1))
        return { value: a2 as number, comparator: a1 }

    if (isBinaryComparator(a2))
        return { min: a1, max: a3 as number, comparator: a2 }

    return a2 === nil 
        ? { value: a1, comparator: '==' }
        : { min: a1, max: a2 as number, comparator: '..' }
}
 
type RangeSettingsSignature = 
    [RangeSettings] | 
    [UnaryComparator, number] | 
    [number, BinaryComparator, number] | 
    [number, number] | 
    [number]

interface RangeValidatorSignature<R> {
    (settings: RangeSettings): R
    (min: number, comparator: BinaryComparator, max: number): R
    (comparator: UnaryComparator, value: number): R
    (min: number, max: number): R
    (equals: number): R
}

//// Operators ////

const unary = {
    compare: {
        '<': (a: number, b: number) => a < b,
        '<=': (a: number, b: number) => a <= b,
        '==': (a: number, b: number) => a === b,
        '>': (a: number, b: number) => a > b,
        '>=': (a: number, b: number) => a >= b,
    },
    detail: {
        '<': (value: number) => `below ${value}`,
        '<=': (value: number) => `equal or below ${value}`,
        '==': (value: number) => `equal ${value}`,
        '>': (value: number) => `above ${value}`,
        '>=': (value: number) => `above or equal ${value}`,
    }
}

const binary = {
    compare: {
        '..': (v: number, min: number, max: number) => v >= min && v < max,
        '...': (v: number, min: number, max: number) => v >= min && v <= max
    },
    detail: {
        '..': (min: number, max: number) => `between ${min} and ${max}`,
        '...': (min: number, max: number) => `from ${min} to ${max}`
    }
}

//// Exports ////

class RangeValidator extends Callable<Validate<number>> {

    settings: RangeSettings

    constructor (settings: RangeSettings)
    constructor (min: number, comparator: BinaryComparator, max: number)
    constructor (comparator: UnaryComparator, value: number)
    constructor (min: number, max: number)
    constructor (equals: number) 
    constructor (...args: RangeSettingsSignature) {

        super((input: number, ctx?: ValidateOptions): number => {

            const context: ValidateContext<number> = { path: [], transform: true, ...ctx, input }
        
            const settings = this.settings
            const isUnary = 'value' in settings
            
            const pass = isUnary
                ? unary.compare[settings.comparator](input, settings.value)
                : binary.compare[settings.comparator](input, settings.min, settings.max)
        
            if (!pass) {
                const detail = isUnary 
                    ? unary.detail[settings.comparator](settings.value)
                    : binary.detail[settings.comparator](settings.min, settings.max)
        
                throw new ValidationError(
                    input, 
                    context, 
                    isFunc(this.settings.error) 
                        ? this.settings.error(input, detail, context) 
                        : this.settings.error ?? `must be ${detail}`
                )
            }
        
            return input
        })

        this.settings = toRangeSettings(args)
    }
}

export default RangeValidator 

export {
    RangeValidator,
    RangeValidatorSignature,

    toRangeSettings,
    RangeSettings,
    RangeSettingsSignature,

}