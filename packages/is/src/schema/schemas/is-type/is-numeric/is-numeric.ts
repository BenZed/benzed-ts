
import IsType from '../is-type'

//// Boolean ////

abstract class IsNumeric<N extends number | bigint> extends IsType<N> { 

}

//// Exports ////

export default IsNumeric

export {
    IsNumeric
}

