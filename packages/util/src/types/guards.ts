import { isBigInt, isBoolean, isEqual, isNumber, isString } from './primitive'
import { AnyTypeGuard, Func, isFunc, TypeGuard, TypeOf, TypesOf } from './func'
import { Json, JsonArray, JsonRecord, JsonPrimitive, Infer, GenericObject } from './types'

import { eachKey } from '../each/generators'
import { eachIndex} from '../each/index-generator'

import { Sortable } from '../sort'
import { Intersect } from './merge'
import { nil } from './nil'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// These are here instead of `is` to resolve conflicting dependencies ////

export const isArray = <T = unknown>(i: unknown): i is T[] => Array.isArray(i)

export const isArrayOf = <T>(type: TypeGuard<T>): TypeGuard<T[]> =>  
    (i: unknown): i is T[] => isArray(i) && i.every(type)

export const isArrayLike = <T = unknown>(i: unknown): i is ArrayLike<T> => {

    if (isString(i))
        return true
    
    if (!isRecord(i) && !isArray(i))
        return false 

    if (!isNumber(i.length))
        return false 

    return true
}

export const isArrayLikeOf = <T>(type: TypeGuard<T>): TypeGuard<ArrayLike<T>> => (i: unknown): i is ArrayLike<T> => {

    if (!isArrayLike(i)) 
        return false

    for (const index of eachIndex(i)) {
        if (!type(i[index]))
            return false
    }

    return true
}

export const isIterable = <T>(input: unknown): input is Iterable<T> => {

    type SymbolIterator = { [Symbol.iterator]: Func }

    return isString(input) ||

        isObject<SymbolIterator>(input) && 
        
        isFunc(input[Symbol.iterator])
}

export const isObject = <T extends object = object>(input: unknown): input is T => 
    isFunc(input) || input !== null && typeof input === 'object'

export function isKeyed<K extends PropertyKey[]>(...keys: K): (input: unknown) => input is Record<K[number], unknown> {
    return (input: unknown): input is Record<K[number], unknown> => {
        if (!isObject(input)) 
            return false
          
        for (const key of keys) {
            if (!(key in input)) 
                return false
                
        }
          
        return true
    }
}

export const isGenericObject = (i: unknown): i is GenericObject =>
    !!i && isGenericPrototype(Object.getPrototypeOf(i))

export const isRecord = <K extends string | number | symbol, V = unknown>(i: unknown): i is Record<K,V> => 
    isGenericObject(i)

// TODO add key type guard
export const isRecordOf = <K extends string | number | symbol,V>(type: TypeGuard<V>): TypeGuard<Record<K, V>> =>  
    (i: unknown): i is Record<K, V> => {
        if (!isRecord(i))
            return false

        for (const key of eachKey(i)) {
            if (!type(i[key]))
                return false
        }

        return true
    }

export const isPromise = <T>(input: unknown): input is Promise<T> => 
    input instanceof Promise

export const isAsync = isPromise //

export const isUnknown = (input: unknown): input is unknown => void input ?? true

export const isSortable = <T extends Sortable>(input: unknown): input is T => {

    if (isRecord(input)) {
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
export type ShapeOutput<T extends ShapeInput> = Infer<{
    [K in keyof T]: TypeOf<T[K]>
}, object>
export const isShape = <T extends ShapeInput>(shape: T): TypeGuard<ShapeOutput<T>> => 
    (input: unknown): input is ShapeOutput<T> => {
        if (!isObject(input))
            return false 

        for (const key of eachKey(shape)) {
            if (!shape[key](input[key as keyof typeof input]))
                return false
        } 

        return true
    }

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

export const isUnion = <T extends AnyTypeGuard[]>(...types: T): TypeGuard<TypesOf<T>[number]> =>
    (i: unknown): i is TypesOf<T>[number] => types.some(type => type(i))

export const isIntersection = <T extends AnyTypeGuard[]>(...types: T): TypeGuard<Intersect<TypesOf<T>>> =>
    (i: unknown): i is Intersect<TypesOf<T>> => types.every(type => type(i))

export const isOptional = <T>(type: TypeGuard<T>): TypeGuard<T | nil> =>  
    (i: unknown): i is T | nil => i === nil || type(i)

const isGenericPrototype = isUnion(isEqual(null), isEqual(Object.prototype as any))

//// Json ////

export const isJsonPrimitive: (input: unknown) => input is JsonPrimitive =
    isUnion(
        isString,
        isNumber,
        isBoolean, 
        isEqual(null)
    )

export const isJsonRecord = (input: unknown): input is JsonRecord => 
    isRecordOf(isJson)(input)

export const isJsonArray = (input: unknown): input is JsonArray => 
    isArrayOf(isJson)(input)

export const isJson: (input: unknown) => input is Json = isUnion(
    isJsonArray,
    isJsonRecord,
    isJsonPrimitive
)

export type JsonShapeInput = Record<string, TypeGuard<unknown>>
export type JsonShapeOutput<T extends JsonShapeInput> = Infer<{
    [K in keyof T]: TypeOf<T[K]>
}, JsonRecord>

export const isJsonShape = <T extends JsonShapeInput>(shape: T): TypeGuard<JsonShapeOutput<T>> => 
    isIntersection(isJsonRecord, isShape(shape)) as TypeGuard<JsonShapeOutput<T>>

