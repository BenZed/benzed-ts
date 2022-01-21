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
export default function toDashCase(
    input: string,
    dash = '-'
): string {

    let output = ''
    let lastCharWasCaseable = false
    for (let i = 0; i < input.length; i++) {

        const char = input.charAt(i)
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