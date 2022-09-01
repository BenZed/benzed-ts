import { Func } from './types'

/*** Types ***/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dispatcher<A extends any[]> = Func<A, void | Promise<void>>

/*** dispatchAll ***/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dispatchAll<A extends any[]>(
    dispatcher: Dispatcher<A>[]
): Dispatcher<A> {

    const dispatchers = Array.isArray(dispatcher)
        ? dispatcher
        : [dispatcher]

    return (...args: A) =>
        dispatchers.forEach(dispatcher => dispatcher(...args))
}

/*** Exports ***/

export default dispatchAll

export {
    dispatchAll
}