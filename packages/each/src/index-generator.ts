import { ToNumber } from '@benzed/util/src/types'

import { defined } from '@benzed/util/src/types/defined'
import { isRecord } from '@benzed/util/src/types/guards'
import { isBoolean, isInteger, isNumber } from '@benzed/util/src/types/primitive'

//// IndexesOf ////

export interface IndexesOfOptions {
    reverse: boolean
    start: number 
    end: number 
    step: number 
}

export type IndexesOfOptionsSignature = 
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

export type Indexable = ArrayLike<unknown> | unknown[] | readonly unknown[]

/*
 * If provided a tuple time, get a union of numeric index literals
 */
export type IndexesOf<A> = A extends [...infer Ax] 
    ? Indexes<Ax>[number]
    : Extract<keyof A, number>

/**
 * Typesafe iteration of the indexes of a given array-like
 */

export function eachIndex<T extends Indexable>(arrayLike: T, reverse: boolean, start: number, end: number, step: number): Generator<IndexesOf<T>>
export function eachIndex<T extends Indexable>(arrayLike: T, reverse: boolean, start: number, end: number): Generator<IndexesOf<T>>
export function eachIndex<T extends Indexable>(arrayLike: T, reverse: boolean, start: number): Generator<IndexesOf<T>>
export function eachIndex<T extends Indexable>(arrayLike: T, reverse: boolean): Generator<IndexesOf<T>>
export function eachIndex<T extends Indexable>(arrayLike: T, start: number, end: number, step: number): Generator<IndexesOf<T>>
export function eachIndex<T extends Indexable>(arrayLike: T, start: number, end: number): Generator<IndexesOf<T>>
export function eachIndex<T extends Indexable>(arrayLike: T, start: number): Generator<IndexesOf<T>>
export function eachIndex<T extends Indexable>(arrayLike: T, options: Partial<IndexesOfOptions>): Generator<IndexesOf<T>>
export function eachIndex<T extends Indexable>(arrayLike: T): Generator<IndexesOf<T>>
export function * eachIndex<T extends Indexable>(arrayLike: T, ...options: IndexesOfOptionsSignature): Generator<IndexesOf<T>> {

    const { start, end, step, reverse } = parseIndexesOfOptions(...options)

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
    
//// Helper ////

/**
 * 
 */
function parseIndexesOfOptions (...options: IndexesOfOptionsSignature): IndexesOfOptions {

    let option: Partial<IndexesOfOptions>
    if (isRecord(options[0])) 
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