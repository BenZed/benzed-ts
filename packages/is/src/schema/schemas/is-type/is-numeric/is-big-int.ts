import { isBigInt as _isBigInt } from '@benzed/util'

import IsNumeric from './is-numeric'

//// Boolean ////

class IsBigInt extends IsNumeric<bigint> {
    constructor() {
        super({
            name: 'bigint',
            is: _isBigInt
        })
    }
}

//// Exports ////

export default IsBigInt

export { IsBigInt }

export const isBigInt = new IsBigInt