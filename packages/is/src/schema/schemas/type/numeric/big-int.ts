import { isBigInt as _isBigInt } from '@benzed/util'

import Numeric from './numeric'

//// Boolean ////

class BigInt extends Numeric<bigint> {
    constructor() {
        super({
            name: 'bigint',
            is: _isBigInt
        })
    }
}

//// Exports ////

export default BigInt

export { BigInt }

export const isBigInt = new BigInt