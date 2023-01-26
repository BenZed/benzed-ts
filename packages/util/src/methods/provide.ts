import { PrivateState } from '../classes'
import { Func, isObject } from '../types'

import { memoize, Memoized } from './memoize'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

interface Provider<F extends Func = Func, C = unknown> { 
    (ctx: C): F
}

type Provided<P extends Provider> = P extends Provider<infer F, unknown> ? F : Func

//// Helper ////

function getMemoizedProvider<P extends Provider<Func, any>>(provider: P, key: object = provider): Provided<P> {

    const memoProviders: PrivateState<object, Memoized<Provider>> = PrivateState.for(provide)
    if (!memoProviders.has(key)) 
        memoProviders.set(key, memoize(provider))
        
    const memoProvider = memoProviders.get(key)
    return memoProvider as Provided<P>
}

//// Main ////

function provide<P extends Provider>(provider: P): Provider<P>
function provide<F extends Func, C extends object>(ctx: C, provider: Provider<F,C>): F 
function provide(...args: [Provider] | [unknown, Provider]): Func {

    const isWithContextSignature = args.length === 2
    if (!isWithContextSignature) {
        const [ provider ] = args
        return getMemoizedProvider(provider)
    }

    const [ ctx, provider ] = args
    if (!isObject(ctx))
        throw new Error('Providing by context requires the contex to be an object.')

    const memoProvider = getMemoizedProvider(provider, ctx)
    return memoProvider(ctx)
}

//// Exports ////

export default provide 

export {
    provide,
    Provider
}