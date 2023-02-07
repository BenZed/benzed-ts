import { indexesOf, keysOf } from '../types/keys-of'
import { isBigInt, isBoolean, isNumber, isString } from './primitive'
import { Func, isFunc, TypeGuard, TypeOf, TypesOf } from './func'
import { Json, JsonArray, JsonRecord, JsonPrimitive } from './types'
import { Sortable } from '../sort'
import { nil } from './nil'
import { Intersect } from './merge'

//// These are here instead of `is` to resolve conflicting dependencies ////

export const isObject = <T extends object = object>(
    i: unknown
): i is T => typeof i === 'object' && i !== null

export const isArray = <T = unknown>(i: unknown): i is T[] => Array.isArray(i)

export const isArrayOf = <T>(type: TypeGuard<T>): TypeGuard<T[]> =>  
    (i: unknown): i is T[] => isArray(i) && i.every(type)

export const isArrayLike = <T = unknown>(i: unknown): i is ArrayLike<T> => {

    if (isString(i))
        return true
    
    if (!isObject<ArrayLike<unknown>>(i))
        return false 

    if (!isNumber(i.length))
        return false 

    return true
}

export const isArrayLikeOf = <T>(type: TypeGuard<T>): TypeGuard<ArrayLike<T>> => (i: unknown): i is ArrayLike<T> => {

    if (!isArrayLike(i)) 
        return false

    for (const index of indexesOf(i)) {
        if (!type(i[index]))
            return false
    }

    return true
}

export const isRecord = <K extends string | number | symbol, V = unknown>(i: unknown): i is Record<K,V> => isObject<Record<K,V>>(i)

// TODO add key type guard
export const isRecordOf = <K extends string | number | symbol,V>(type: TypeGuard<V>): TypeGuard<Record<K, V>> =>  
    (i: unknown): i is Record<K, V> => {
        if (!isRecord(i))
            return false

        for (const key of keysOf(i)) {
            if (!type(i[key]))
                return false
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

export const isAsync = isPromise //

export const isUnknown = (input: unknown): input is unknown => void input ?? true

export const isSortable = <T extends Sortable>(input: unknown): input is T => {

    if (isObject(input)) {
        input = 'length' in input && isNumber(input.length)
            ? input.length 
            : input.valueOf()
    }

    return isNumber(input) || 
        isString(input) ||
        isBigInt(input) || 
        isBoolean(input)
}

const { isFinite } = Number 
export { isFinite }

//// Compound ////

export type ShapeInput = Record<string | symbol, TypeGuard<unknown>>
export type ShapeOutput<T extends ShapeInput> = {
    [K in keyof T]: TypeOf<T[K]>
}
export const isShape = <T extends ShapeInput>(shape: T): TypeGuard<ShapeOutput<T>> => 
    (input: unknown): input is ShapeOutput<T> => 
        isObject<ShapeOutput<T>>(input) && 
        Object.entries(shape).every(([key, type]) => type(input[key]))

export type TupleInput = TypeGuard<unknown>[]
export type TupleOuput<T extends TupleInput> = T extends [infer T1, ...infer Tr]
    ? T1 extends TypeGuard<infer O> 
        ? Tr extends TupleInput 
            ? [O, ...TupleOuput<Tr>]
            : [O]
        : []
    : []

export const isTuple = <T extends TupleInput>(...types: T): TypeGuard<TupleOuput<T>> => 
    (input: unknown): input is TupleOuput<T> => 
        isArray(input) &&
        input.length === types.length &&
        types.every((type, i) => type(input[i]))

export const isUnion = <T extends TypeGuard<unknown>[]>(...types: T): TypeGuard<TypesOf<T>[number]> =>
    (i: unknown): i is TypesOf<T>[number] => types.some(type => type(i))

export const isIntersection = <T extends TypeGuard<unknown>[]>(...types: T): TypeGuard<Intersect<TypesOf<T>>> =>
    (i: unknown): i is TypesOf<T>[number] => types.every(type => type(i))
        
export const isOptional = <T>(type: TypeGuard<T>): TypeGuard<T | nil> =>  
    (i: unknown): i is T | nil => i === nil || type(i)

//// Json ////

export const isJsonPrimitive = (input: unknown): input is JsonPrimitive => 
    isString(input) || isNumber(input) || isBoolean(input) || input === null

export const isJsonObject = (input: unknown): input is JsonRecord => 
    isRecordOf(isJson)(input)

export const isJsonArray = (input: unknown): input is JsonArray => 
    isArrayOf(isJson)(input)

export const isJson = (input: unknown): input is Json => 
    isJsonPrimitive(input) || isJsonArray(input) || isJsonObject(input)

isJson.Array = isJsonArray
isJson.Object = isJsonObject
isJson.Primitive = isJsonPrimitive