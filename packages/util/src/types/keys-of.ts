import { property } from '../property'

import defined from './defined'

import { isBoolean, isInteger, isNumber } from './primitive'
import { isObject } from './guards'
import { ToNumber } from './types'

//// Helper ////

const count = (iterator: Iterator<unknown>): number => {
    let count = 0
    while (!iterator.next().done)
        count++ 

    return count
}

//// KeysOf ////

export type KeysOf<T> = Extract<keyof T, string>

export type KeysOfType<T,V> = keyof {
    [K in keyof T as T[K] extends V ? K : never]: never
} extends infer Tk extends keyof T ? Tk : never

/**
 * Iteration of enumerable string keys on any number of objects
 */
export function * keysOf<T extends object[] | readonly object[]> (
    ...objects: T
): Generator<KeysOf<T[number]>> {

    const keys: Set<string> = new Set()

    for (const object of objects) {
    
        for (const string in object) {
            const key = string as KeysOf<T[number]>
            if (keys.has(key))
                continue 
            else {
                keys.add(key)
                yield key
            }
        }
    }
}
keysOf.count = (...objects: object[]): number => count(keysOf(...objects))

//// SymbolsOf ////

export type SymbolsOf<T> = Extract<keyof T, symbol>

/**
 * Iteration of enumerable symbol keys on any number of objects
 */
export function * symbolsOf<T extends object[] | readonly object[]> (
    ...objects: T
): Generator<SymbolsOf<T[number]>> {

    const symbols: Set<symbol> = new Set()

    for (const object of objects) {
        for (const symbol of property.symbolsOf(object)) {
            if (symbols.has(symbol))
                continue
        
            const descriptor = property.descriptorOf(object, symbol)
            if (!descriptor)
                continue 

            if (descriptor.enumerable) {
                symbols.add(symbol)
                yield symbol as SymbolsOf<T[number]>
            }
        }
    }
}
symbolsOf.count = (...objects: object[]): number => count(symbolsOf(...objects))

//// IndexesOf ////

interface IndexesOfOptions {
    reverse: boolean
    start: number 
    end: number 
    step: number 
}

type IndexesOfOptionsSignature = 
    [] | 
    [start: number] | 
    [start: number, end: number] |
    [start: number, end: number, step: number ] |
    [reverse: boolean] | 
    [reverse: boolean, start: number] | 
    [reverse: boolean, start: number, end: number] | 
    [reverse: boolean, start: number, end: number, step: number ] | 
    [ Partial<IndexesOfOptions>]

export type Indexes<A extends unknown[] | readonly unknown[]> = {
    [K in keyof A]: ToNumber<K>
}

type Indexable = ArrayLike<unknown> | unknown[] | readonly unknown[]

/*
 * If provided a tuple time, get a union of numeric index literals
 */
export type IndexesOf<A> = A extends [...infer Ax] 
    ? Indexes<Ax>[number]
    : Extract<keyof A, number>

/**
 * Typesafe iteration of the indexes of a given array-like
 */

export function indexesOf<T extends Indexable>(arrayLike: T, reverse: boolean, start: number, end: number, step: number): Generator<IndexesOf<T>>
export function indexesOf<T extends Indexable>(arrayLike: T, reverse: boolean, start: number, end: number): Generator<IndexesOf<T>>
export function indexesOf<T extends Indexable>(arrayLike: T, reverse: boolean, start: number): Generator<IndexesOf<T>>
export function indexesOf<T extends Indexable>(arrayLike: T, reverse: boolean): Generator<IndexesOf<T>>
export function indexesOf<T extends Indexable>(arrayLike: T, start: number, end: number, step: number): Generator<IndexesOf<T>>
export function indexesOf<T extends Indexable>(arrayLike: T, start: number, end: number): Generator<IndexesOf<T>>
export function indexesOf<T extends Indexable>(arrayLike: T, start: number): Generator<IndexesOf<T>>
export function indexesOf<T extends Indexable>(arrayLike: T, options: Partial<IndexesOfOptions>): Generator<IndexesOf<T>>
export function indexesOf<T extends Indexable>(arrayLike: T): Generator<IndexesOf<T>>
export function * indexesOf<T extends Indexable>(arrayLike: T, ...options: IndexesOfOptionsSignature): Generator<IndexesOf<T>> {

    const { start, end, step, reverse } = indexesOf.options(...options)

    const max = end < 0 ? arrayLike.length + end : end
    if (step < 0 || !isInteger(step))
        throw new Error('step must be a positive integer')

    if (start < 0 || !isInteger(start))
        throw new Error('start must be a positive integer')

    if (!isInteger(max))
        throw new Error('end must resolve to an integer')

    for (
        let i = reverse ? max : start; 
        reverse ? i >= start : i <= max; 
        reverse ? i -= step : i += step
    )
        yield i as IndexesOf<T>
}

indexesOf.fromTuple = <T extends unknown[] | readonly unknown[]>(...array: T): Indexes<T> =>
    array.map((_, i) => i) as unknown as Indexes<T>
    
indexesOf.options = (...options: IndexesOfOptionsSignature): IndexesOfOptions => {

    let option: Partial<IndexesOfOptions>
    if (isObject<Partial<IndexesOfOptions>>(options[0])) 
        option = options[0]
    else {
        const args = options as (number | boolean)[]
        const [start, end, step] = args.filter(isNumber)
        const [reverse] = args.filter(isBoolean)
        option = defined({ start, end, step, reverse })
    }

    return {
        start: 0, 
        end: -1,
        reverse: false,
        step: 1,
        ...option
    }

}