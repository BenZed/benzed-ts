import { TypeValidator } from '@benzed/schema'
import { isBigInt, isString } from '@benzed/util'
import { Numeric } from './numeric'

//// BigInt ////

class BigIntValidator extends TypeValidator<bigint> {

    isValid(input: unknown): input is bigint {
        return isBigInt(input)
    }

    override cast(value: unknown) {
        if (isString(value)) {
            try {
                return globalThis.BigInt(value)
            } catch {
                return value
            }
        }
        return value
    }
}

//// Ex[prts] ////

export class BigInt extends Numeric<bigint, {}> {

    constructor() {
        super(new BigIntValidator, {})
    }

}

export const $bigint = new BigInt