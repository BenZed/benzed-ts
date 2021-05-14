/**
 * Converts a string from camel case to dash case.
 * 
 * ```typescript
 * toDashCase('fooBar') // 'foo-bar'
 * ```
 * 
 * @param str String to convert to dash case
 * @param dash character(s) to use as dash
 * @return dash cased string
 */
export default function toDashCase(
    str: string,
    dash = '-'
): string {

    if (str == null)
        str = ''

    let output = ''
    let lastCharWasCaseable = false
    for (let i = 0; i < str.length; i++) {

        const char = str.charAt(i)
        const charUp = char.toUpperCase()
        const charLo = char.toLowerCase()
        const charIsCaseable = charUp !== charLo

        const isUpperChar = charIsCaseable && char === charUp
        const outputIsEmpty = output.length === 0

        // Dashes should:
        // - be placed between lower and previously upper case characters
        // - NOT be first or last character in output
        // - NOT appear more than once consecutively
        const requiresDash =
            isUpperChar && lastCharWasCaseable ||
            charIsCaseable && !lastCharWasCaseable && !outputIsEmpty
        if (requiresDash)
            output += dash

        if (charIsCaseable)
            output += charLo

        lastCharWasCaseable = charIsCaseable
    }

    return output
}