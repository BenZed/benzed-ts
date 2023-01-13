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
function provide<F extends Func, C>(ctx: C, provider: Provider<F,C>): F {

    type P = Provider<F,C>

    const memoProviders: PrivateState<P, Memoized<P>> = PrivateState.for(provide)
    if (!memoProviders.has(provider)) 
        memoProviders.set(provider, memoize(provider))

    const memoProvider = memoProviders.get(provider)
    return memoProvider(ctx)
}

//// Exports ////

export default provide 

export {
    provide,
    Provider
}