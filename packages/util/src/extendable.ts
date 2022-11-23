import { merge, Merge } from './merge'
import { Func } from './types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbol ////

const $$extendable = Symbol('extendable-method')

//// Types ////

type Extendable<T extends Func, E extends object> =
    ((...args: Parameters<T>) => ReturnType<T>) & 
    {
        [K in keyof E | 'extend']: K extends 'extend' 
            ? <Ex extends object>(extension: Ex) => Extendable<T, Merge<[E, Ex]>> 
            : K extends keyof E ? E[K] : K
    }

//// Helper ////

function extend <C extends Func, E extends object>(this: C, extension: E): Extendable<C, E> {

    const method = $$extendable in this 
        ? (this as C & { [$$extendable]: C })[$$extendable] 
        : this

    return extendable(method, { ...this, ...extension }) as Extendable<C, E>
}

//// Main ////

/**
 * Creates an extendable method
 * 
 * @param method Call function
 * @param instance Original interface
 * 
 * @returns Given function agumented with properties from given interface
 */
function extendable<F extends Func, O extends object>(method: F, instance: O): Extendable<F,O> {

    const extendable = {
        ...instance,
        extend,
        [$$extendable]: method,
    }

    return merge(method.bind(extendable), extendable) as Extendable<F,O>
}

//// Exports ////

export default extendable

export {
    extendable,
    Extendable
}