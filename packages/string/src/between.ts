/**
 * Gets a substring between the given delimeter(s).
 * 
 * ```typescript
 *  between('<tag><a>content</tag>', '<tag>', '</tag>') // 'content'
 * ```
 *
 * @param  str Source string.
 * @param  open Open delimiter.
 * @param  close=open Close delimiter.
 *
 * @return Substring of the source between the two markers. Empty string if nothing found.
 */
function between(
    str: string,
    open: string,
    close = open
): string {

    if (!open || !close)
        throw new Error(`delimeters must not be empty`)

    const openStartIndex = str.indexOf(open)
    if (openStartIndex === -1)
        return ``

    const openEndIndex = openStartIndex + open.length

    const closeLength = str.substring(openEndIndex).indexOf(close)
    if (closeLength === -1)
        return ``

    return str.substring(openEndIndex, openEndIndex + closeLength)
}

/*** Exports ***/

export default between

export {
    between
}