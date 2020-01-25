/**
 * 
 * Capitalize a string
 * 
 * ```typescript
 * capitalize('ace') // 'Ace'
 * ```
 * 
 * @param str String to capitalize, `undefined` or `null` will return `''`.
 * 
 */
export default function capitalize(str: string): string {

    const firstLetter = str.charAt(0)
    const restOfTheString = str.slice(1)

    return firstLetter.toUpperCase() + restOfTheString
}