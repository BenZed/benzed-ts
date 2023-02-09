import { Resolver } from '../classes'
import { Func, NamesOfType } from '../types'

//// Types ////

type Override<T extends object, K extends NamesOfType<T, Func>> = K extends keyof T 
    ? T[K] extends Func 
        ? (original: T[K], ...args: Parameters<T[K]>) => ReturnType<T[K]>
        : Func
    : Func

interface OverrideAction {
    <F extends () => unknown>(action: F): ReturnType<F>
}

//// Helper ////

/**
 * Temporarily override a method
 * 
 * @param object Object to override
 * @param key key of method on object to override 
 * @param override overridden method
 * 
 * @returns A function 
 */
export function override<T extends object, K extends NamesOfType<T, Func>>(
    object: T, 
    key: K, 
    override: Override<T, K>
): OverrideAction {

    // State
    const method = object[key]
    const boundMethod = (method as Func).bind(object) as T[K]

    const applyOverride = (): void => {
        type P = T[K] extends Func ? Parameters<T[K]> : []
        object[key] = ((...args: P) => override(boundMethod, ...args)) as T[K]
    }

    // Helpers
    const revertOverride = (result?: unknown): unknown => {
        object[key] = method
        return result
    }

    // Override Action
    const overrideAction = <F extends () => unknown>(action: F): ReturnType<F> => {
        applyOverride()
        return new Resolver(action())   
            .then(revertOverride)
            .output as ReturnType<F>
    }

    return overrideAction as OverrideAction
}