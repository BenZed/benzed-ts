import { isSymbol } from '@benzed/util'
import Type, { TypeExtendSettings } from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

interface SymbolSettings extends TypeExtendSettings<symbol> {}

//// Exports ////

class Symbol extends Type<symbol> {

    constructor(settings?: SymbolSettings) {
        super({
            name: 'symbol',
            isValid: isSymbol,
            ...settings
        })
    }

}

//// Exports ////

export default Symbol

export {
    Symbol,
    SymbolSettings
}

export const $symbol = new Symbol()
