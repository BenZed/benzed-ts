import { defineName, isFunction, isObject, nil } from '@benzed/util'
import { extend, Extended } from '@benzed/immutable'

import { Validate, ValidateContext, ValidateOptions, ValidationError } from '../validator'

/* eslint-disable 
    @typescript-eslint/no-this-alias
*/

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

    if (isObject<RangeSettings>(a1) || isFunction<RangeValidator>(a1))
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

type RangeValidator = Validate<unknown, number> & RangeSettings

interface Range<R> {
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

//// Details ////

const assertRange = defineName(function (this: RangeSettings, input: number, ctx?: ValidateOptions): number {

    const context: ValidateContext<number> = { path: [], transform: true, ...ctx, input }

    const settings = this
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
            isFunction(this.error) 
                ? this.error(input, detail, context) 
                : this.error ?? `must be ${detail}`
        )
    }

    return input
}, 'range')

//// Exports ////

const range: Range<RangeValidator> = (...args: RangeSettingsSignature) => 
    extend(assertRange, toRangeSettings(args)) as Extended<Validate<unknown, number>, RangeSettings>

export default range 

export {
    range,
    Range,

    RangeValidator,

    toRangeSettings,
    RangeSettings,

    RangeSettingsSignature,
}