
import { RangeValidator, SubValidation } from '@benzed/schema'
import { Ceil, Finite, Floor, Round } from './sub-validators'
import Type from '../type'

//// Symbols ////

const $$finite = Symbol('infinite-validator')
const $$round = Symbol('round-validator')

//// Numeric ////

abstract class AbstractNumeric<N extends number | bigint> extends Type<N> { 

    range = new SubValidation(RangeValidator<N>, this)

}

abstract class AbstractNumber extends AbstractNumeric<number> {

    finite = new SubValidation(Finite, this, $$finite)

    infinite(): this {
        return this.finite(false)
    }

    round = new SubValidation(Round, this, $$round)
    floor = new SubValidation(Floor, this, $$round)
    ceil = new SubValidation(Ceil, this, $$round)

}

//// Exports ////

export default AbstractNumeric

export {
    AbstractNumeric,
    AbstractNumber
}