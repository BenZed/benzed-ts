import { pluck } from '@benzed/array'
import { defined, isBoolean, isEqual } from '@benzed/util'
import { 
    SubValidator, 
    SubValidators, 
    TypeSchema, 
    TypeValidator, 
    ValidationErrorMessage
} from '@benzed/schema'

import { Limit } from './sub-validators/limit'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

type NumericValidator<N extends bigint | number> = TypeValidator<N> 
type NumericSubValidators<N extends bigint | number> = SubValidators<SubValidator<N>>

type LimitComparator = '<' | '<=' | '>=' | '>'

type RangeComparator = '..' | '...'
const isRangeComparator: (input: unknown) => input is RangeComparator 
    = isEqual('..', '...')

//// Exports ////

export abstract class Numeric<N extends bigint | number, S extends NumericSubValidators<N>>
    extends TypeSchema<
    /**/ NumericValidator<N>,
    /**/ S & { min: Limit<N>, max: Limit<N> }
    > {

    constructor(main: NumericValidator<N>, sub: S) {
        super(
            main,
            {
                ...sub,
                min: new Limit('min'),
                max: new Limit('max')
            } 
        )
    }

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

}

export const $number = new Number