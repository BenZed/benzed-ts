/* eslint-disable @typescript-eslint/no-explicit-any */

//// Main ////

/**
 * re-use the same promise to prevent multiple invocations of the
 * same asyncronous task
 */
function retreive<T, A extends any[]>(
    action: (...args: A) => Promise<T>
): () => Promise<T> {

    let result: Promise<T> | undefined = undefined

    return (...args: A): Promise<T> => {

        if (result === undefined)
            result = action(...args)

        return result
    }

}

//// Exports ////

export default retreive

export {
    retreive
}