import { Schema } from '@benzed/schema'
import { isBigInt, isString } from '@benzed/util'

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

interface BigInt extends SchemaBuilder<BigIntValidator, {
    range: Range
}> {

}

const BigInt = class BigInt extends Schema<BigIntValidator, {}> {

    constructor() {
        super()
    }
}

//// BigInt ////

class BigIntValidator extends NumericValidator<bigint> {

    constructor() {
        super(isBigInt)
    }
 
    override cast = toBigInt
}

//// Exports ////

export default BigIntValidator

export { BigIntValidator }

export const $bigint = new BigIntValidator