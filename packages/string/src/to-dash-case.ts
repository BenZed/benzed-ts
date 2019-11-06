/**
 * ./to-dash-case
 * Converts a string from camel case to dash case.
 * 
 * ```typescript
 * toDashCase('fooBar') // 'foo-bar'
 * ```
 * 
 * @param this Optionally bindable
 * @param str String to convert to dash case
 * @param dash character(s) to use as dash
 * 
 */
export default function toDashCase(
    this: string,
    str: string | void,
    dash = '-'
): string {

    if (typeof this === 'string') {
        dash = str || dash
        str = this
    }

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
        // - be placed between lower and upper case characters
        // - NOT be first or last character in output
        // - NOT appear more than once consecutively
        const requiresDash =
            (isUpperChar && lastCharWasCaseable) ||
            (charIsCaseable && !lastCharWasCaseable && !outputIsEmpty)
        if (requiresDash)
            output += dash

        if (charIsCaseable)
            output += charLo

        lastCharWasCaseable = charIsCaseable
    }

    return output
}