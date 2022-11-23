import { merge, Merge } from './merge'
import { Func } from './types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbol ////

const $$extendable = Symbol('extendable-origin')

//// Types ////

type Extend<A extends object, B extends object> = (A & B) extends infer O 
    ? { [K in keyof O]: O[K] }
    : never

type Extendable<T extends Func, E extends object> = ((...args: Parameters<T>) => ReturnType<T>) & {
    [K in keyof E | 'extend']: K extends 'extend' 
        ? <Ex extends object>(extension: Ex) => Extendable<T, Extend<E, Ex>> 
        : K extends keyof E ? E[K] : K
}

//// Helper ////

function extend <C extends Func, E extends object>(this: C, extension: E): Extendable<C, E> {

    const f = $$extendable in this ? (this as C & { [$$extendable]: Func })[$$extendable] : this

    return extendable(f, { ...this, ...extension }) as Extendable<C, E>
}

//// Main ////

/**
 * Create an extendable function instnace
 * @param method Call function
 * @param instance Original interface
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