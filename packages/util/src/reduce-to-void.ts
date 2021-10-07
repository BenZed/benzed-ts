// import { isPromise } from '@benzed/is'

const isPromise = (i: unknown): i is Promise<unknown> => i instanceof Promise

/*** reduceToVoid ***/

function reduceToVoid(input: unknown): void | Promise<void> {

    if (isPromise(input))
        return input.then(reduceToVoid)

    if (Array.isArray(input) && input.some(isPromise))
        return Promise.all(input).then(reduceToVoid)
}

/*** Exports ***/

export default reduceToVoid

export {
    reduceToVoid
}