import { ReferenceMap } from '../classes/reference-map'
import type { Func, nil } from '../types'

//// Data ////

const cache = new ReferenceMap<[unknown, Func], Func>()

//// Types ////

interface Provided<F extends Func, C> { 
    (ctx: C): F
}

/**
 * Provide a memoized context to a method.
 */
function provide<F extends Func, C>(ctx: C, provided: Provided<F,C>): F {

    const key = [ctx, provided] as [unknown, Func]

    let provider = cache.get(key) as F | nil
    if (!provider) {
        provider = ((...args) => provided(ctx)(...args)) as F
        cache.set(key, provider)
    }

    return provider
}

//// Exports ////

export default provide 

export {
    provide,
    Provided
}