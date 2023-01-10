
import { isSymbol as _isSymbol } from '@benzed/util'

import IsType from './is-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Boolean ////

class IsSymbol extends IsType<symbol> {
    constructor() {
        super({
            type: 'symbol',
            is: _isSymbol
        })
    }
}

//// Exports ////

export default IsSymbol

export const isSymbol = new IsSymbol

export {
    IsSymbol
}