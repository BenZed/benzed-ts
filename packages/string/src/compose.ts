import { nil, through as isTruthy } from '@benzed/util'

//// Helper ////

function compose(
    delimiter: string,
    ...input: (string | nil)[]
): string {
    return input.filter(isTruthy).join(delimiter)
}

//// Exports ////

/**
 * Combine a series of strings into words. 
 * If any of the input strings are falsy,
 * they are omitted.
 * 
 */
export function words(
    ...input: (string | nil)[]
): string {
    return compose(' ', ...input)
}

/**
 * Combine a series of strings into lines. 
 * If any of the input strings are empty or undefined,
 * they are omitted.
 * 
 */
export function lines(
    ...input: (string | nil)[]
): string {
    return compose('\n', ...input)
}

