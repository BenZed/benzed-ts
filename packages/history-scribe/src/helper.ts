import { resolveIndex as _resolveIndex } from '@benzed/array'
import { defined, each, isDefined, isEmpty, isNumber, isRecord } from '@benzed/util'
import { equals } from '@benzed/immutable'

import { HistoryEntry, HistoryMeta, HistoryMethods } from './types'

//// Exports //// 

export function toDate(a: Date | number | string): Date {
    return a instanceof Date ? a : new Date(a)
}

export function isSameAgeOrOlder(a: Date | number | string, b: Date | number | string): boolean {
    return toDate(a) <= toDate(b)
}

/**
 * Resolve a history index to a specific entry from either a date or an index.
 * @param indexOrDate 
 * @param entries 
 * @param allowEndIndex 
 * @returns 
 */
export function resolveIndex<T extends object, I>(
    indexOrDate: Date | number | string,
    entries: HistoryEntry<T, I>[],
    allowEndIndex = false
): number {

    if (indexOrDate === entries.length && allowEndIndex)
        return indexOrDate

    if (isNumber(indexOrDate))
        return _resolveIndex(entries.length, indexOrDate)

    const date = toDate(indexOrDate)

    return entries
        .filter(entry => date.getTime() >= entry.timestamp)
        .length
}

/**
 * Assign defined data from a source object onto a target.
 * @param target 
 * @param source 
 */
export function assignDefined<T extends object>(
    target: T,
    source: Partial<T>
): T {

    for (const key of each.keyOf(defined(source))) 
        target[key] = source[key] as T[typeof key]

    return target
}

/**
 * Determine weather or not the given entry contains data.
 * @param entry 
 * @returns 
 */
export function entryContainsData<T extends object, I>(
    entry: HistoryEntry<T, I>
): entry is
    ({ method: HistoryMethods.Update, data: Partial<T> } | { method: HistoryMethods.Create, data: T })
    & HistoryMeta<I> {
    return 'data' in entry && !isEmpty(entry.data)
}

/**
 * Resolve a HistoryMeta object out of it's potential sources.
 * @param signatureOrMeta 
 * @returns 
 */
export function resolveHistoryMeta<I>(
    signatureOrMeta?: I | Partial<HistoryMeta<I>>
): HistoryMeta<I> {

    const partialMeta = isRecord(signatureOrMeta) &&
        ('signature' in signatureOrMeta || 'timestamp' in signatureOrMeta)
        ? signatureOrMeta
        : {
            signature: signatureOrMeta ?? null
        } as Partial<HistoryMeta<I>>

    return {
        timestamp: Date.now(),
        signature: null,
        ...partialMeta
    }
}

/**
 * Get an update entry that includes the provided data merged in with the provided patch entry.
 * @param input 
 * @param data 
 * @returns 
 */
export function mergeUpdateEntry<T extends object, I>(
    input: { method: HistoryMethods.Update, data: Partial<T> } & HistoryMeta<I>,
    data: Partial<T>,
): { method: HistoryMethods.Update, data: Partial<T> } & HistoryMeta<I> {

    const output = {
        ...input,
        data: assignDefined(input.data, data)
    }

    return output
}

/**
 * Get a update entry that doesn't include any shared keys from the provided data with
 * the provided entry
 * @param input 
 * @param data 
 * @returns 
 */
export function cleanUpdateEntry<T extends object, I>(
    input: { method: HistoryMethods.Update, data: Partial<T> } & HistoryMeta<I>,
    data: T
): { method: HistoryMethods.Update, data: Partial<T> } & HistoryMeta<I> {

    const output: { method: HistoryMethods.Update, data: Partial<T> } & HistoryMeta<I> = {
        ...input,
        data: {}
    }

    for (const key of each.keyOf(data)) {
        if (!equals(data[key], input.data[key]) && isDefined(input.data[key]))
            output.data[key] = input.data[key]
    }

    return output
}