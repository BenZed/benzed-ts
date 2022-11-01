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
function capitalize<S extends string>(str: S): Capitalize<S> {

    const firstLetter = str.charAt(0)
    const restOfTheString = str.slice(1)

    return firstLetter.toUpperCase() + restOfTheString as Capitalize<S>
}

//// Exports ////

export default capitalize

export {
    capitalize
}