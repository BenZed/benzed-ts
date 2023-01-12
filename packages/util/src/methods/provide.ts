import { PrivateState } from '../classes'
import type { Func } from '../types'

import { memoize, Memoized } from './memoize'

//// Types ////

interface Provider<F extends Func, C> { 
    (ctx: C): F
}

/**
 * Receive a function memoized by the given context and provider method.
 */
function provide<F extends Func, C>(ctx: C, provided: Provider<F,C>): F {

    type P = Provider<F,C>

    const providers: PrivateState<P, Memoized<P>> = PrivateState.for(provide)

    if (!providers.has(provided)) 
        providers.set(provided, memoize(provided))

    const provider = providers.get(provided)
    return provider(ctx)
}

//// Exports ////

export default provide 

export {
    provide,
    Provider
}