import is from '@benzed/is'
import { resolveIndex as _resolveIndex } from '@benzed/array'
import { equals } from '@benzed/immutable'
import { HistoryEntry, HistoryMeta } from './types'

/*** Exports ***/

export function toDate(a: Date | number | string): Date {
    return is.date(a) ? a : new Date(a)
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

    if (is.number(indexOrDate))
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
export function applyData<T extends object>(
    target: T,
    source: Partial<T>
): T {

    for (const key in source) {
        if (source[key] !== undefined)
            target[key] = source[key] as T[typeof key]
    }

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
    ({ method: 'patch', data: Partial<T> } | { method: 'create', data: T })
    & HistoryMeta<I> {
    return `data` in entry &&
        Object.keys(entry.data).length > 0
}

/**
 * Resolve a HistoryMeta object out of it's potential sources.
 * @param signatureOrMeta 
 * @returns 
 */
export function resolveHistoryMeta<I>(
    signatureOrMeta?: I | Partial<HistoryMeta<I>>
): HistoryMeta<I> {

    const partialMeta = is.object(signatureOrMeta) &&
        (`signature` in signatureOrMeta || `timestamp` in signatureOrMeta)
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
 * Get a patch entry that includes the provided data merged in with the provided patch entry.
 * @param input 
 * @param data 
 * @returns 
 */
export function mergePatchEntry<T extends object, I>(
    input: { method: 'patch', data: Partial<T> } & HistoryMeta<I>,
    data: Partial<T>,
): { method: 'patch', data: Partial<T> } & HistoryMeta<I> {

    const output = {
        ...input,
        data: applyData({ ...input.data }, data)
    }

    return output
}

/**
 * Get a patch entry that doesn't include any shared keys from the provided data with
 * the provided entry
 * @param input 
 * @param data 
 * @returns 
 */
export function cleanPatchEntry<T extends object, I>(
    input: { method: 'patch', data: Partial<T> } & HistoryMeta<I>,
    data: T
): { method: 'patch', data: Partial<T> } & HistoryMeta<I> {

    const output: { method: 'patch', data: Partial<T> } & HistoryMeta<I> = {
        ...input,
        data: {}
    }

    for (const key in data) {
        if (
            !equals(data[key], input.data[key]) &&
            input.data[key] !== undefined
        )
            output.data[key] = input.data[key]

    }

    return output
}