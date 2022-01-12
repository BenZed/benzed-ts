import { Func } from './types'

type Callback<T> = Func<[Error | null, T]>

/*** Main ***/

/**
 * Wrapper for promisifying oldschool callback pattern
 * @param func 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function promisify<A extends any[], T>(
    func: (Func<[...A, Callback<T>], void>)
): Func<A, Promise<T>> {

    return (...args: A) =>

        new Promise((resolve, reject) =>
            func(
                ...args,

                (e: Error | null, value: T) => e
                    ? reject(e)
                    : resolve(value)
            )
        )

}

/*** Exports ***/

export default promisify

export {
    promisify
}