
import { ValidationContext } from '@benzed/schema'
import { hideNonStateKeys } from '@benzed/immutable'

import { isNumber, isString } from '@benzed/util'

import { TypeValidator } from '../../../validators'
import { Ceil, Finite, Floor, Round } from './sub-validators'

//// Helper ////

const toNumber = (value: unknown): unknown => {

    if (isString(value)) {
        const parsed = parseFloat(value)
        if (!isNaN(parsed))
            return parsed
    }

    return value
}

//// Numeric ////

abstract class NumericValidator<N extends number | bigint> extends TypeValidator<N> { 

    constructor(readonly isValid: (input: unknown, ctx: ValidationContext<unknown>) => input is N) {
        super()
        hideNonStateKeys(this, 'isValid')
    }

}

abstract class NumberValidator extends NumericValidator<number> {

    constructor() {
        super(isNumber)
    }

    override cast = toNumber

}

//// Exports ////

export default NumericValidator

export {
    NumericValidator,
    NumberValidator
}