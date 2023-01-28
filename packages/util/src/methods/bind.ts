//// Main ////

import { Property } from '../property'
import { Func, Infer } from '../types'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type _ParamOptions<P extends unknown[]> = P extends [infer F1, ...infer Fr]
    ? [F1] | [F1, ..._ParamOptions<Fr>]
    : P

type _ParamIntersect<A extends unknown[], B extends unknown[]> = B extends [any, ...infer Br]
    ? A extends [any, ...infer Ar]
        ? _ParamIntersect<Ar,Br>
        : A extends unknown[] 
            ? A
            : Br
    : A

//// Types ////

type BindableParams<F extends Func> = _ParamOptions<Parameters<F>>

type Bound<F extends Func, A extends BindableParams<F>> = 
    Infer<(...params: _ParamIntersect<Parameters<F>, A>) => ReturnType<F>>

/**
 * Bind parameters to a method, leaving it's this context untouched.
 */
function bind<F extends Func, B extends BindableParams<F>>(func: F, ...boundParams: B): Bound<F, B> {

    if (boundParams.length === 0)
        return func
   
    const bound: Bound<F, B> = function (this: unknown, ...looseParams) {
        return func.call(this, ...boundParams, ...looseParams)
    }

    return Property.name(bound, func.name)
}

//// Exports ////

export default bind

export {
    bind,
    BindableParams,
    Bound
}