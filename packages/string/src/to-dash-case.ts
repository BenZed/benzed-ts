import { Join, Split, Trim } from './types'

//// Types ////

type _ToChars<S extends string> = Split<S, ''>

type _CharsToDashCase<C extends string[]> = C extends [infer Sx, ...infer Sr]
    ? Sx extends string 
        ? Sr extends string[]
            ? Sx extends Capitalize<Sx> 
                ? `-${Lowercase<Sx>}${_CharsToDashCase<Sr>}`
                : `${Sx}${_CharsToDashCase<Sr>}`
            : Sx
        : ''
    : ''

type _TrimCharsToDashCase<C extends string[]> = Trim<_CharsToDashCase<C>, '-'> 

/**
 * 'fromCamelCase' -> 'from-camel-case'
 * ['from', 'array'] -> 'from-array'
 */
type ToDashCase<S extends string | string[]> = 
    string extends S 
        ? string 
        : S extends string 
            ? _TrimCharsToDashCase<_ToChars<S>>
            : S extends string[]
                ? Trim<Join<S, '-'>, '-'>
                : string

//// Helper ////

function fromCamelCase(
    input: string,
    dash = '-'
): string {

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

//// Main ////

/**
 * Converts a string from camel case to dash case.
 * 
 * ```typescript
 * toDashCase('fooBar') // 'foo-bar'
 * ```
 * 
 * @param input String to convert to dash case
 * @return dash cased string
 */
function toDashCase<S extends string>(
    input: S,
): ToDashCase<S> {
    return fromCamelCase(input, '-') as ToDashCase<S>
}

//// Exports ////

export default toDashCase

export {
    toDashCase,
    ToDashCase
}