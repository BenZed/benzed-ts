// import { isPromise } from '@benzed/is'

//// Helper ////

const isPromise = (i: unknown): i is Promise<unknown> => i instanceof Promise

//// Types ////

type ReduceToVoid<T> = (T extends Promise<unknown> | Promise<unknown>[] ? Promise<void> : void)

//// reduceToVoid ////

function reduceToVoid<T>(
    input?: T
): ReduceToVoid<T> {

    if (isPromise(input))
        return input.then(reduceToVoid) as ReduceToVoid<T>

    if (Array.isArray(input) && input.some(isPromise))
        return Promise.all(input).then(reduceToVoid) as ReduceToVoid<T>

    return undefined as ReduceToVoid<T>
}

//// Exports ////

export default reduceToVoid

export {
    reduceToVoid
}