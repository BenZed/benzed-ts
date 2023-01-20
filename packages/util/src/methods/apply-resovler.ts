import { isPromise } from '../types'

//// Types ////

type Resolver<T> = (input: Awaited<T>) => unknown

type Resolved<T, R extends Resolver<T>> = T extends Promise<unknown> 
    ? Promise<ReturnType<R>>
    : ReturnType<R>

//// Main ////

/**
 * Apply a method to a value. If the given value is a promise, wait until it is
 * resolved first.
 */
function applyResolver<T, R extends Resolver<T>>(input: T, resolver: R): Resolved<T, R> {

    return (
        isPromise(input)
            ? input.then(resolved => {
                try {
                    return resolver(resolved as Awaited<T>)
                } catch (e) {
                    return Promise.reject(e)
                }
            })
            : resolver(input as Awaited<T>)
    ) as Resolved<T, R> 
}

//// Exports ////

export default applyResolver

export {
    applyResolver
}