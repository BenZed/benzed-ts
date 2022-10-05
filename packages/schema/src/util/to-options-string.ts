
/*** Main ***/

function toOptionsString(
    input: readonly (string | number | boolean | null | undefined)[]
): string {

    const [last, ...first] = [...input].reverse()
    // c, ...ba

    return first.reverse() // ab
        .join(', ') // a, b
        .concat(
            last ? ` or ${last}` : ''
        ) // a, b or c
}

/*** Exports ***/

export default toOptionsString

export {
    toOptionsString
}