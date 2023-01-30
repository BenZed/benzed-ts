
import Type from '../type'

//// Numeric ////

abstract class Numeric<N extends number | bigint> extends Type<N> { }

//// Exports ////

export default Numeric

export {
    Numeric
}