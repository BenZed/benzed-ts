
import { isSymbol as _isSymbol } from '@benzed/util'

import Type from './type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Boolean ////

class Symbol extends Type<symbol> {
    constructor() {
        super({
            name: 'symbol',
            is: _isSymbol
        })
    }
}

//// Exports ////

export default Symbol

export {
    Symbol
}

export const isSymbol = new Symbol
