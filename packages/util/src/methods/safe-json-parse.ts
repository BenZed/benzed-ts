import { nil } from '../types'

//// Main ////

function safeJsonParse<T>(
    input: string,
    isType?: (input: unknown) => input is T
): T | nil {

    let output: unknown
    try {
        output = JSON.parse(input)
    } catch { }

    return !isType || isType(output) ? output as T : nil
}

function safeJsonStringify(
    input: unknown
): string | nil {
    try {
        return JSON.stringify(input)
    } catch { 
        return nil
    }
}

//// Exports ////

export default safeJsonParse

export {
    safeJsonParse,
    safeJsonStringify
}