import { indexesOf, keysOf } from '../methods'
import { Func, TypeGuard } from './types'

//// These are here instead of `is` to resolve conflicting dependencies ////

export const isString = <S extends string = string>(i: unknown): i is S => typeof i === 'string'

export const isNumber = <N extends number = number>(i: unknown): i is N => typeof i === 'number' && !Number.isNaN(i)

export const isBoolean = <B extends boolean = boolean>(i: unknown): i is B => typeof i === 'boolean'

export const isSymbol = <S extends symbol>(i: unknown): i is S => typeof i === 'symbol'

export const isFunc = <F extends Func = Func>(i: unknown): i is F => typeof i === 'function'

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

export const isInteger = (i: unknown): i is number =>
    Number.isInteger(i)
