import { merge, Merge } from './merge'
import { keysOf } from './iterate'
import { Func } from './types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbol ////

const $$extendable = Symbol('extendable')

//// Types ////

type _ExtendableData = {        
    method: Func, 
    instance: object, 
    bind?: boolean
}

type Extendable<T extends Func, E extends object> =
    ((...args: Parameters<T>) => ReturnType<T>) & 
    {
        [K in keyof E | 'extend']: K extends 'extend' 
            ? <Ex extends object>(extension: Ex, bind?: boolean) => Extendable<T, Merge<[E, Ex]>> 
            : K extends keyof E ? E[K] : K
    }

//// Helper ////


function extend <C extends Func, E extends object>(this: C, extension: E, bind?: boolean): Extendable<C, E> {

    const data = this as unknown as (_ExtendableData & { [$$extendable]?: _ExtendableData })

    const { method, instance, bind: bound } = data[$$extendable] ?? data

    return extendable(method, { ...instance, ...extension }, bind ?? bound)
}

//// Main ////

/**
 * Creates an extendable method
 * 
 * @param method Call function
 * @param instance Original interface
 * @param bind bind methods to the instance object
 * 
 * @returns Given function agumented with properties from given interface
 */
function extendable<F extends Func, O extends object>(method: F, instance: O, bind?: boolean): Extendable<F,O> {

    const extendable = {
        ...instance,
        extend,
        [$$extendable]: { method, instance, bind },
    }

    if (bind) for (const key of keysOf(extendable)) {
        const value = extendable[key]
        if (typeof value === 'function')
            extendable[key] = value.bind(extendable)
    }

    return merge(method.bind(extendable), extendable) as Extendable<F,O>
}

//// Exports ////

export default extendable

export {
    extendable,
    Extendable
}