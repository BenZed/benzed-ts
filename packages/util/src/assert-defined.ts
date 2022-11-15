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
function assertDefined<F extends Func>(
    input: F,
    err = 'Value null or undefined.'
): (...args: Parameters<F>) => Exclude<ReturnType<F>, null | undefined> {
    return (...args: Parameters<F>) => {

        const output = input(...args)
        if (output == null)
            throw new Error(err)

        return output as Exclude<ReturnType<F>, null | undefined> 
    }
}

//// Exports ////

export default assertDefined

export {
    assertDefined
}