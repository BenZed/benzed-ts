import { Schema } from '@benzed/schema'
import { isBigInt, isString } from '@benzed/util'
import { TypeSchema } from '../../type'

import NumericValidator from './numeric'
import { Round } from './sub-validators'

//// Helper ////

const toBigInt = (value: unknown): unknown => {

    if (isString(value)) {
        try {
            return globalThis.BigInt(value)
        } catch {
            return value
        }
    }

    return value
}

//// Types ////

//// BigInt ////

class BigIntValidator extends NumericValidator<bigint> {

    constructor() {
        super(isBigInt)
    }
 
    override cast = toBigInt
}

class BigInt extends TypeSchema<BigIntValidator, {}> {

    constructor() {
        super()
    }
}

//// Exports ////

export default BigIntValidator

export { BigIntValidator }

export const $bigint = new BigIntValidator