import { indexesOf, keysOf } from '../types/keys-of'
import { isNumber, isString } from './primitive'
import { Func, isFunc, TypeGuard } from './func'

//// These are here instead of `is` to resolve conflicting dependencies ////

export const isObject = <T extends object = object>(i: unknown): i is T => typeof i === 'object' && i !== null

export const isArray = <T = unknown>(
    i: unknown, 
    ofType?: TypeGuard<T>
): i is T[] => 
    Array.isArray(i) && (!ofType || i.every(ofType)) 

export const isArrayLike = <T = unknown>(
    i: unknown, 
    ofType?: TypeGuard<T>
): i is ArrayLike<T> => {

    if (isString(i))
        return !ofType || i.split('').every(ofType) // <- lol
    
    if (!isObject<ArrayLike<unknown>>(i))
        return false 

    if (!isNumber(i.length))
        return false 

    if (ofType) {
        for (const index of indexesOf(i)) {
            if (!ofType(i[index]))
                return false
        }
    } 
                
    return true
}

export const isRecord = <K extends string | number | symbol, V = unknown>(
    i: unknown, 
    ofType?: TypeGuard<V>
): i is Record<K,V> => {

    if (!isObject<Record<K,V>>(i))
        return false 

    if (ofType) {
        for (const key of keysOf(i)) {
            if (!ofType(i[key]))
                return false
        }
    }

    return true
}

export const isIterable = <T>(input: unknown): input is Iterable<T> => {

    type SymbolIterator = { [Symbol.iterator]: Func }

    return isString(input) ||

        (
            isObject<SymbolIterator>(input) || 
            isFunc<Func & SymbolIterator>(input)
        ) && 
        
        isFunc(input[Symbol.iterator])
}

export const isPromise = <T>(input: unknown): input is Promise<T> => 
    input instanceof Promise