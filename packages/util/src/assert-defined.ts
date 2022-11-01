import { Func } from './types'

//// Main ////

/**
 * Takes a method that optionally returns a nullable value and 
 * returns one that doesn't.
 * 
 * @param input Method that optionally returns a nullable value 
 * @param err Message to throw if the return value is nullable.
 * @returns Equivalent method that throws an error instead of
 * returning a nullable value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertDefined<A extends any[], T>(
    input: Func<A, T | undefined | null>,
    err = `Value null or undefined.`
): Func<A, T> {
    return (...args: A) => {

        const output = input(...args)
        if (output == null)
            throw new Error(err)

        return output
    }
}

//// Exports ////

export default assertDefined

export {
    assertDefined
}