
import IsPrimitive from '../is-primitive'

//// Boolean ////

abstract class IsNumeric<N extends number | bigint> extends IsPrimitive<N> { 

}

//// Exports ////

export default IsNumeric

export {
    IsNumeric
}

