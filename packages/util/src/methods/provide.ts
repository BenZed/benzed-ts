import { Func, nil } from '../types'

////  ////

const cache = new Map<unknown, Func>()

////  ////

interface Provided<F extends Func, C> {
    (ctx: C): F
}

/**
 * Provide a memoized context to a method.
 */
function provide<F extends Func, C>(ctx: C, provided: Provided<F,C>): F {

    let provider = cache.get(ctx) as F | nil
    if (!provider) {
        provider = ((...args) => provided(ctx)(...args)) as F
        cache.set(ctx, provider)
    }

    return provider
}

//// Exports ////

export default provide 

export {
    provide,
    Provided
}