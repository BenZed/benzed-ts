import { Join, Split } from './types'

/**
* `spaced out values` => `spaced-out-values`
* `underscore_values` => `underscore-values`
* ['You', 'Get','The','Idea] => `you-get-the-idea`
*/
type ToDashCase<S extends string | string[] | readonly string[], D extends string = '_' | ' '> = 
 string extends S ? string : // ignore untyped string
     S extends string[] | readonly string[]
         ? Lowercase<Join<S, '-'>>
         : S extends string 
             ? ToDashCase<Split<S, D | '-'>>
             : never

// TODO FIXME the type behaviour and the method behaviour are not the same. 
// One simply replaces a delimiter with a dash, the other converts from camel case. 
// Rethink this.

/**
 * Converts a string from camel case to dash case.
 * 
 * ```typescript
 * toDashCase('fooBar') // 'foo-bar'
 * ```
 * 
 * @param input String to convert to dash case
 * @param dash character(s) to use as dash
 * @return dash cased string
 */
function toDashCase(
    input: string,
    dash = '-'
): string { // TODO use ToDashCase type, once it handles casing

    let output = ''
    let prevCharIsCaseable = false
    let prevCharIsDigit = false
    for (let i = 0; i < input.length; i++) {

        const char = input.charAt(i)
        const charUp = char.toUpperCase()
        const charLo = char.toLowerCase()
        const isDigit = char >= '0' && char <= '9'
        const isCaseable = charUp !== charLo

        const isUpper = isCaseable && char === charUp
        const outputIsEmpty = output.length === 0

        // Dashes should:
        // - be placed between lower and previously upper case characters
        // - NOT be first or last character in output
        // - NOT appear more than once consecutively
        const requiresDash =
            isUpper && prevCharIsCaseable ||
            isDigit && (!prevCharIsCaseable && !prevCharIsDigit && !outputIsEmpty) ||
            isCaseable && !prevCharIsCaseable && !outputIsEmpty
        if (requiresDash)
            output += dash

        if (isCaseable || isDigit)
            output += charLo

        prevCharIsCaseable = isCaseable
        prevCharIsDigit = isDigit
    }

    return output
}

//// Exports ////

export default toDashCase

export {
    toDashCase,
    ToDashCase
}