import { isBigInt } from '@benzed/util'

import Numeric from './numeric'

//// Boolean ////

class BigInt extends Numeric<bigint> {
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