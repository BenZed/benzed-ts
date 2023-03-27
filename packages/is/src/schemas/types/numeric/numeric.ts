import { pluck } from '@benzed/array'
import { defined, isBoolean, isEqual } from '@benzed/util'
import { 
    SubValidator, 
    SubValidators, 
    TypeSchema, 
    TypeValidator, 
    ValidationErrorMessage,
} from '@benzed/schema'

import { Limit } from './sub-validators/limit'
import { MultipleOf, MultipleOfSettingsSignature, toMultipleOfSettings, MultipleOfSettings } from './sub-validators'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

type numeric = bigint | number

type NumericValidator<N extends numeric> = TypeValidator<N> 
type NumericSubValidators<N extends numeric> = SubValidators<SubValidator<N>>

type LimitComparator = '<' | '<=' | '>=' | '>'

type RangeComparator = '..' | '...'
const isRangeComparator: (input: unknown) => input is RangeComparator 
    = isEqual('..', '...')

type EvenSettings<N extends numeric> = Omit<MultipleOfSettings<N>, 'value'>

//// Exports ////

export abstract class Numeric<N extends numeric, S extends NumericSubValidators<N>>
    extends TypeSchema<
    /**/ NumericValidator<N>,
    /**/ S & { min: Limit<N>, max: Limit<N>, multipleOf: MultipleOf<N> }
    > {

    constructor(main: NumericValidator<N>, sub: S) {
        super(
            main,
            {
                ...sub,
                min: new Limit('min'),
                max: new Limit('max'),
                multipleOf: new MultipleOf()
            } 
        )
    }

    //// Multiple Of ////

    multipleOf(enabled: false): this 
    multipleOf(value: N, message?: ValidationErrorMessage<N>): this
    multipleOf(...signature: MultipleOfSettingsSignature<N>): this 
    multipleOf(...signature: []): this {
        const options = toMultipleOfSettings(...signature as any) as any
        return this._applySubValidator(
            'multipleOf', 
            options
        )
    }

    even(enabled: false): this
    even(message?: ValidationErrorMessage<N>): this
    even(options?: EvenSettings<N>): this
    even(input?: boolean | ValidationErrorMessage<N> | EvenSettings<N>): this | boolean {
        const options = toMultipleOfSettings(input as any)
        return this.multipleOf({
            message: 'must be even',
            ...options,
            value: this._two,
        })
    }

    odd(enabled: false): this
    odd(message?: ValidationErrorMessage<N>): this
    odd(input?: boolean | ValidationErrorMessage<N> | EvenSettings<N>): this | boolean {
        const options = toMultipleOfSettings(input as any)
        return this.even({
            message: 'must be odd',
            ...options,
            not: true 
        })
    }

    /**
     * 2 if this is a number validator, 2n if bigint validator.
     */
    protected abstract get _two(): N

    protected get _zero(): N {
        return this._two - this._two as N
    }

    //// Range ////
    
    range(enabled: false): this
    range(min: N, max: N, message?: ValidationErrorMessage<N>): this
    range(min: N, comparator: RangeComparator, max: N, message?: ValidationErrorMessage<N>): this 
    range(...signature: [false] | [N, N, ValidationErrorMessage<N>?] | [N, RangeComparator, N, ValidationErrorMessage<N>?]): this {
         
        const [ enabled = true ] = pluck(signature, isBoolean)
        const maxInclusive = pluck(signature, isRangeComparator)[0] === '...'
        const [ minValue, maxValue, message ] = signature as [N,N, ValidationErrorMessage<N>?]

        const min = defined({ value: minValue, message, inclusive: true, enabled })
        const max = defined({ value: maxValue, message, inclusive: maxInclusive, enabled })

        return this
            ._applySubValidator('min', min as any)
            ._applySubValidator('max', max as any)
    }

    limit(comparator: LimitComparator, value: N, message?: ValidationErrorMessage<N>): this {
        const inclusive = comparator.includes('=')
        const limit = comparator.includes('<') ? 'max' : 'min'

        return this
            ._applySubValidator(limit, defined({ value, inclusive, message, enabled: true }) as any)
    }

    min(value: N, message?: ValidationErrorMessage<N>): this {
        return this.limit('>=', value, message)
    }

    max(value: N, message?: ValidationErrorMessage<N>): this {
        return this.limit('<=', value, message)
    }

    above(value: N, message?: ValidationErrorMessage<N>): this {
        return this.limit('>', value, message)
    }
    aboveOrEqual(value: N, message?: ValidationErrorMessage<N>): this {
        return this.limit('>=', value, message)
    }

    below(value: N, message?: ValidationErrorMessage<N>): this {
        return this.limit('<', value, message)
    }
    belowOrEqual(value: N, message?: ValidationErrorMessage<N>): this {
        return this.limit('<=', value, message)
    }

    positive(message?: ValidationErrorMessage<N>): this {
        return this.limit(
            '>=', 
            this._zero, 
            message ?? 'must be positive'
        )
    }

    negative(message?: ValidationErrorMessage<N>): this {
        return this.limit(
            '<', 
            this._zero, 
            message ?? 'must be negative'
            )
    }

}

export const $number = new Number