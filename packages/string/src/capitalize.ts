/**
 * 
 * Capitalize a string
 * 
 * ```typescript
 * capitalize('ace') // 'Ace'
 * ```
 * 
 * @param this Optionally bindable
 * @param str String to capitalize, `undefined` or `null` will return `''`.
 * 
 */
export default function capitalize(this: string | void, str?: string): string {

    if (typeof this === 'string')
        str = this

    if (str == null)
        str = ''

    const firstLetter = str.charAt(0)
    const restOfTheWord = str.slice(1)

    return firstLetter.toUpperCase() + restOfTheWord
}