/**
 * Converts a string to camelCase.
 * 
 * ```typescript
 * toCamelCase('whats-up-man') // whatsUpMan
 * ```
 *
 * @param  str Input.
 * @param  delimiter=/-/ Delimiter.
 * @return camelCased string.
 */
function toCamelCase(this: string | void, str: string, delimiter: string | RegExp = /-/): string {

    if (this !== undefined) {
        delimiter = str || delimiter
        str = this
    }

    let camelCased = ''
    let capitalizeNext = false

    if (typeof delimiter === 'string')
        delimiter = new RegExp(delimiter)

    for (let i = 0; i < str.length; i++) {

        const char = str.charAt(i)

        if (delimiter.test(char))
            capitalizeNext = true

        else if (capitalizeNext) {
            camelCased += char.toUpperCase()
            capitalizeNext = false

        } else
            camelCased += char

    }

    return camelCased
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default toCamelCase
