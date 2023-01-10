
import { isSymbol } from '@benzed/util'

import IsType from './is-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Boolean ////

class IsSymbol extends IsType<symbol> {
    constructor() {
        super({
            type: 'symbol',
            is: isSymbol
        })
    }
}

//// Exports ////

export default IsSymbol

export {
    IsSymbol
}