
/*** Main ***/

function safeJsonParse<T>(
    json: string,
    isType: (input: unknown) => input is T
): T | undefined {

    let output: unknown
    try {
        output = JSON.parse(json)
    } catch { }

    return isType(output) ? output : undefined

}

/*** Exports ***/

export default safeJsonParse

export {
    safeJsonParse
}