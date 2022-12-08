import { Func, memoize as _memoize, MemoizeOptions, Memoized } from '@benzed/util'

import { ValueMap } from './value-map'

//// Main ////

function memoize<F extends Func>(f: F, name?: string): Memoized<F>

function memoize<F extends Func>(f: F, maxCacheSize?: number): Memoized<F>

function memoize<F extends Func>(f: F, options?: { name?: string, maxCacheSize?: number }): Memoized<F>

function memoize<F extends Func>(
    func: F,
    options?: string | number | Omit<MemoizeOptions<F>, 'cache'>
): Memoized<F> {

    const { name, maxCacheSize } = _memoize.options(func, options)
 
    return _memoize(func, { 
        name, 
        maxCacheSize, 

        // all we need to do to switch from parameter identical memoization
        // to parameter deep-equal memoization is switch the cache type.
        cache: new ValueMap<Parameters<F>, ReturnType<F>>()
    })
}

//// Exports ////

export default memoize

export {
    memoize
}