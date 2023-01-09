import { PrivateState } from '../classes'
import type { Func } from '../types'

//// Types ////

interface Provided<F extends Func, C> { 
    (ctx: C): F
}

/**
 * Provide a memoized context to a method.
 */
function provide<F extends Func, C extends object>(ctx: C, provided: Provided<F,C>): F {
    if (!PrivateState.has(ctx))
        PrivateState.set(ctx, (...args: unknown[]) => provided(ctx)(...args))

    return PrivateState.get(ctx) as F
}

//// Exports ////

export default provide 

export {
    provide,
    Provided
}