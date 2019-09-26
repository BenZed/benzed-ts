/**
 * Gets a substring between the two given markers.
 * 
 * ```typescript
 *  between('<tag>content</tag>', '<tag>', '<tag/>')
 * ```
 *
 * @param  str Source string.
 * @param  open Open marker.
 * @param  close=open Close marker.
 *
 * @return Substring of the source between the two markers. Empty string if nothing found.
 */
function between(this: string | void, str: string, open: string, close = open): string {

    if (this !== undefined) {
        close = open === undefined ? str : open
        open = str
        str = this
    }

    if (!open || !close)
        throw new Error('delimeters must not be empty')

    const openIndex = str.indexOf(open)
    if (openIndex === -1)
        return ''

    let closeIndex = str.substr(openIndex + open.length).indexOf(close)
    if (closeIndex === -1)
        return ''

    closeIndex += open.length

    return str.substr(openIndex, closeIndex + close.length)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default between
