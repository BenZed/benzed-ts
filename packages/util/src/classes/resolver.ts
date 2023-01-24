import { isPromise } from 'util/types'

//// Types ////

type Then<T> = (input: Awaited<T>) => unknown

type Resolve<T, F extends Then<T>> = T extends Promise<unknown> 
    ? Resolver<Promise<Awaited<ReturnType<F>>>>
    : Resolver<ReturnType<F>>

//// Main ////

/**
 * Optionally syncronous thenable
 */
class Resolver<T> {

    constructor(readonly value: T) {}

    then<F extends Then<T>>(func: F): Resolve<T,F> {
        const { value } = this

        const output = isPromise(value)
            ? value.then(func as Then<unknown>)
            : func(value as Awaited<T>)

        return new Resolver(output) as Resolve<T,F>
    }
}

//// Exports ////

export default Resolver

export {
    Resolver
}