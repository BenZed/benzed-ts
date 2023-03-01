
import { TypeValidator } from '@benzed/schema'

import { isNumber, isString } from '@benzed/util'

//// Numeric ////

abstract class NumericValidator<N extends number | bigint> extends TypeValidator<N> { 

}

//// Exports ////

export default NumericValidator

export {
    NumericValidator
}