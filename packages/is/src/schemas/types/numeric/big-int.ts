import { isBigInt } from '@benzed/util'

import AbstractNumeric from './numeric'

//// Boolean ////

class BigInt extends AbstractNumeric<bigint> {
    constructor() {
        super({
            name: 'bigint',
            isValid: isBigInt
        })
    }
}

//// Exports ////

export default BigInt

export { BigInt }

export const $bigint = new BigInt