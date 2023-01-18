import { nil } from '../types'

//// Main ////

function safeJsonParse<T>(
    json: string,
    isType?: (input: unknown) => input is T
): T | nil {

    let output: unknown
    try {
        output = JSON.parse(json)
    } catch { }

    return !isType || isType(output) ? output as T : nil
}

//// Exports ////

export default safeJsonParse

export {
    safeJsonParse
}