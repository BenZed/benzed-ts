
import { RangeValidator, SubValidation, ValidationErrorInput } from '@benzed/schema'
import Type from '../type'

//// Symbols ////

const $$range = Symbol('range-validator')

//// Numeric ////

abstract class Numeric<N extends number | bigint> extends Type<N> { 

    range = new SubValidation(RangeValidator<N>, this, $$range)

    above(value: N, error?: ValidationErrorInput<N>): this {
        return this.range({ comparator: '>', value, error })
    }

    below(value: N, error?: ValidationErrorInput<N>): this {
        return this.range({ comparator: '<', value, error })
    }

    equalOrBelow(value: N, error?: ValidationErrorInput<N>): this {
        return this.range({ comparator: '<=', value, error })
    }

    equalOrAbove(value: N, error?: ValidationErrorInput<N>): this {
        return this.range({ comparator: '>=', value, error })
    }

    between(min: N, max: N, error?: ValidationErrorInput<N>): this {
        return this.range({ min, comparator: '..', max, error })
    }

}

//// Exports ////

export default Numeric

export {
    Numeric
}