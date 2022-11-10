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

//// Exports ////

export default toDashCase

export {
    toDashCase
}